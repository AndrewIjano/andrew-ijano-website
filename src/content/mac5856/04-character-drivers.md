---
title: '[Tutorial] Character Drivers'
description: 'This is the report about the fourth tutorial for the Linux Kernel development: Setting up a test environment for Linux Kernel Dev using QEMU and libvirt'
pubDate: '26 Mar 2025'
---

This is the report about the fourth tutorial for the Linux Kernel development: [Setting up a test environment for Linux Kernel Dev using QEMU and libvirt](https://flusp.ime.usp.br/kernel/qemu-libvirt-setup/). The tutorial provides an incredible introduction about character devices in the Linux kernel.

## A character device driver example

To learn more about character devices, I started creating a simple character device example at `${IIO_TREE}/drivers/char/simple_char.c`. 


```c
#include <linux/init.h>
#include <linux/module.h>

#include <linux/kdev_t.h> /* for MAJOR */
#include <linux/cdev.h> /* for cdev */
#include <linux/fs.h> /* for chrdev functions */
#include <linux/slab.h> /* for malloc */
#include <linux/string.h> /* for strlen() */
#include <linux/uaccess.h> /* copy_to_user() */

struct cdev *s_cdev;
static dev_t dev_id;

#define S_BUFF_SIZE 4096
static char *s_buf;

#define MINOR_NUMS 1

static int simple_char_open(struct inode *inode, struct file *file)
{
	pr_info("%s: %s\n", KBUILD_MODNAME, __func__);
	return 0;
}

static ssize_t simple_char_read(struct file *file, char __user *buffer,
				size_t count, loff_t *ppos)
{
	int n_bytes;

	pr_info("%s: %s about to read %ld bytes from buffer position %lld\n",
		KBUILD_MODNAME, __func__, count, *ppos);
	n_bytes = count - copy_to_user(buffer, s_buf + *ppos, count);
	*ppos += n_bytes;
	return n_bytes;
}

static ssize_t simple_char_write(struct file *file, const char __user *buffer,
				size_t count, loff_t *ppos)
{
	int n_bytes;
	pr_info("%s: %s about to write %ld bytes to buffer position %lld\n",
		KBUILD_MODNAME, __func__, count, *ppos);
	n_bytes = count - copy_from_user(s_buf + *ppos, buffer, count);
	return n_bytes;
}

static int simple_char_release(struct inode *inode, struct file *file)
{
	pr_info("%s: %s\n", KBUILD_MODNAME, __func__);
	return 0;
}

static const struct file_operations simple_char_fops = {
	.owner = THIS_MODULE,
	.open = simple_char_open,
	.release = simple_char_release,
	.read = simple_char_read,
	.write = simple_char_write,
};

static int __init simple_char_init(void)
{
	int ret;

	pr_info("Initialize %s module.\n", KBUILD_MODNAME);

	/* Allocate an internal buffer for reads and writes. */
	s_buf = kmalloc(S_BUFF_SIZE, GFP_KERNEL);
	if (!s_buf)
		return -ENOMEM;

	strcpy(s_buf, "This is data from simple_char buffer.");

	/* Dynamically allocate character device device numbers. */
	/* The name passed here will appear in /proc/devices. */
	ret = alloc_chrdev_region(&dev_id, 0, MINOR_NUMS, "simple_char");
	if (ret < 0)
		return ret;

	/* Allocate and initialize the character device cdev structure */
	s_cdev = cdev_alloc();
	s_cdev->ops = &simple_char_fops;
	s_cdev->owner = simple_char_fops.owner;

	/* Adds a mapping for the device ID into the system. */
	return cdev_add(s_cdev, dev_id, MINOR_NUMS);
}

static void __exit simple_char_exit(void)
{
	/*
	 * Undoes the device ID mapping and frees cdev struct, removing the
	 * character device from the system.
	 */
	cdev_del(s_cdev);
	/* Unregisters (disassociate) the device numbers allocated. */
	unregister_chrdev_region(dev_id, MINOR_NUMS);

	kfree(s_buf);
	pr_info("%s exiting.\n", KBUILD_MODNAME);
}

module_init(simple_char_init);
module_exit(simple_char_exit);

MODULE_AUTHOR("A Linux kernel student <my email>");
MODULE_DESCRIPTION("A simple character device driver example.");
MODULE_LICENSE("GPL");
```

And I added the configuration for the module like in the previous tutorial:

```sh
# ${IIO_TREE}/drivers/char/Kconfig
config SIMPLE_CHAR
       tristate "Simple character driver example"
       default m
       help
         This option enables a simple character driver that implements basic
         file access operations.
```

```makefile
# ${IIO_TREE}/drivers/char/Makefile
obj-$(CONFIG_SIMPLE_CHAR)      += simple_char.o
```

Then, I configured this new module with `make olddefconfig` and built it with `make -j4 clean; make -j4 Image.gz modules`. As always, this compilation took a lot of time.

## Testing the new driver

With the new image compiled, I tested the new driver inside the VM.

```
root@localhost:~# modprobe simple_char
root@localhost:~# cat /proc/devices | grep simp
239 simple_char
root@localhost:~# mknod simple_char_node c 239 0
root@localhost:~# stat simple_char_node
  File: simple_char_node
  Size: 0         	Blocks: 0          IO Block: 4096   character special file
Device: 254,2	Inode: 29501       Links: 1     Device type: 239,0
Access: (0644/crw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)
Access: 2025-03-29 15:23:30.665155951 +0000
Modify: 2025-03-29 15:23:30.665155951 +0000
Change: 2025-03-29 15:23:30.665155951 +0000
Birth: 2025-03-29 15:23:30.665155951 +0000
```

> The `mknod NAME TYPE MAJOR MINOR` command is responsible for creating a special file `FILE` of `TYPE` with `MAJOR` and `MINOR` number. In our case, it's creating a `simple_char_node` file of type `c`, which is a character (unbuffered) special file, and a major number `239` and minor number `0`.

Then I created a `read_prog.c` program to test reading from this character device.

```c
#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>

#define BUF_SIZE 256

/* Example inspired from open(2) */
int main(int argc, const char **argv)
{
	char buf[BUF_SIZE];
	int fd;

	if (argc < 2)
		return -22;

	fd = open(argv[1], O_RDONLY);
	read(fd, buf, BUF_SIZE);
	printf("Read buffer: %s\n", buf);
	close(fd);
}
```

By compiling it with `aarch64-linux-gnu-gcc` and sending it to the VM, we could test it:

```
root@localhost:~# ./read_prog simple_char_node 
Read buffer: This is data from simple_char buffer.
```

After that, I created a program to write to the device.

```c
#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>
#include <errno.h>

#define BUF_SIZE 256

int main(int argc, const char **argv)
{
	char buf[BUF_SIZE];
	int errsv;
	int ret;
	int fd;

	if (argc < 2)
		return -EINVAL;

	sprintf(buf, "A new message for simple_char.");
	fd = open(argv[1], O_RDWR);
	ret = write(fd, buf, BUF_SIZE);
	if (ret < 0) {
		errsv = errno;
		printf("Error: %d", errsv);
	}
	printf("wrote %d bytes to buffer\n", ret);
	return close(fd);
}
```

By compiling it and sending it to the VM, I could test it:

```
root@localhost:~# ./write_prog  simple_char_node 
wrote 256 bytes to buffer
root@localhost:~# ./read_prog simple_char_node 
Read buffer: A new message for simple_char.
```

And that's the logs for it.

```
[   99.901129] Initialize simple_char module.
[ 1039.965854] simple_char: simple_char_open
[ 1039.966109] simple_char: simple_char_read about to read 256 bytes from buffer position 0
[ 1039.971482] simple_char: simple_char_release
[ 1193.785469] simple_char: simple_char_open
[ 1193.785760] simple_char: simple_char_write about to write 256 bytes to buffer position 0
[ 1193.792990] simple_char: simple_char_release
[ 1198.051454] simple_char: simple_char_open
[ 1198.051664] simple_char: simple_char_read about to read 256 bytes from buffer position 0
[ 1198.063498] simple_char: simple_char_release
```