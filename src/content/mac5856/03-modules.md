---
title: '[Tutorial] Build configuration and modules'
description: 'This is the report about the third tutorial for the Linux Kernel development: Introduction to Linux kernel build configuration and modules'
pubDate: 'Mar 19 2025'
---

This is the report about the third tutorial for the Linux Kernel development: [Introduction to Linux kernel build configuration and modules](https://flusp.ime.usp.br/kernel/modules-intro/).

In this tutorial, I created test modules to explore how the process of build and configurating new modules to the Linux kernel works.

## 1. Creating a simple example module

First, I created the following module at `${IIO_TREE}/drivers/misc/simple_mod.c`.

```c
#include <linux/module.h>
#include <linux/init.h>

static int __init simple_mod_init(void)
{
	pr_info("Hello world\n");
	return 0;
}

static void __exit simple_mod_exit(void)
{
	pr_info("Goodbye world\n");
}

module_init(simple_mod_init);
module_exit(simple_mod_exit);

MODULE_LICENSE("GPL");
```

This module will log messages when it's installed and uninstalled.

## 2. Creating Linux kernel configuration symbols

After that, I added a configuration symbol and an entry in the Makefile.

```conf
# ${IIO_TREE}/drivers/misc/Kconfig
config SIMPLE_MOD
	tristate "Simple example Linux kernel module"
	default	n
	help
	  This option enables a simple module that says hello upon load and
	  bye on unloading.
```
```makefile
# ${IIO_TREE}/drivers/misc/Makefile
obj-$(CONFIG_SIMPLE_MOD)		+= simple_mod.o
```

## 3. Configuring the Linux kernel build with menuconfig

With the configuration symbols created, I needed to enable the module in the menuconfig (`make menuconfig` in the iio directory).

Then, in the same directory, I cleaned artifacts and built the image and modules again. This compilation took almost 20 minutes to finish!

```sh
make -j$(nproc) clean
make -j$(nproc) Image.gz modules
```

After that, it was just a matter of mounting the vm with the new image and connecting it with ssh.

```sh
sudo guestmount --rw --add "${VM_DIR}/arm64_img.qcow2" --mount /dev/sda2 "${VM_MOUNT_POINT}"
sudo --preserve-env make -C "${IIO_TREE}" modules_install
sudo guestunmount "$VM_MOUNT_POINT"

sudo virsh start arm64
sudo virsh start arm64
sudo virsh net-dhcp-leases default
ssh root@192.168.122.45 # that's the IP from the previous command
```

By verifying the kernel version inside the VM, we can see it's correct.

```sh
# @VM
root@localhost:~# uname --all
Linux localhost 6.14.0-rc1-turing+ #2 SMP PREEMPT Wed Mar 19 17:19:10 -03 2025 aarch64 GNU/Linux

root@localhost:~# cat /proc/version
Linux version 6.14.0-rc1-turing+ (andrew@delta4) (aarch64-linux-gnu-gcc (GCC) 14.2.0, GNU ld (GNU Binutils) 2.43) #2 SMP PREEMPT Wed Mar 19 17:19:10 -03 2025

```

> During this process, I had the following problem.
>
>```
> error: failed to connect to the hypervisor
> error: Operation not supported: Cannot use direct socket > mode if no URI is set. For more information see
> https://libvirt.org/kbase/failed_connection_after_install.?html
>```
>
> At first, I struggled a little to understand what was wrong but then I remembered we had to start the libvirtd service in the first tutorial and it was probably down in this moment, since I restarted my machine. By running `sudo systemctl start libvirtd` and `sudo virsh net-start default` again it was solved.


## 4. Installing Linux kernel modules

In this part, I tested how we could install and uninstall kernel modules.

First I checked information about my new test module with `modinfo`.

```
root@localhost:~# modinfo simple_mod
filename:       /lib/modules/6.14.0-rc1-turing+/kernel/drivers/misc/simple_mod.ko
license:        GPL
depends:
intree:         Y
name:           simple_mod
vermagic:       6.14.0-rc1-turing+ SMP preempt mod_unload aarch64
```

Then, I ensured my module wasn't installed by listing installed modules with `lsmod`.
```
root@localhost:~# lsmod
Module                  Size  Used by
cfg80211              421888  0
rfkill                 28672  2 cfg80211
fuse                  155648  1
drm                   544768  0
dm_mod                131072  0
ip_tables              28672  0
x_tables               36864  1 ip_tables
```


By installing the module with `insmod` and checking the kernel log messages, we can see that our `Hello World` message is prompted. 

```
root@localhost:~# dmesg | tail
[   43.136175 ] systemd[1]: Started systemd-udevd.service - Rule-based Manager for Device Events and Files.
[   43.422468 ] systemd[1]: Starting systemd-networkd.service - Network Configuration...
[   46.219553 ] cfg80211: Loading compiled-in X.509 certificates for regulatory database
[   46.519529 ] systemd[1]: Started systemd-journald.service - Journal Service.
[   46.829940 ] Loaded X.509 cert 'sforshee: 00b28ddf47aef9cea7'
[   46.844600 ] Loaded X.509 cert 'wens: 61c038651aabdcf94bd0ac7ff06c7248db18c600'
[   46.848407 ] platform regulatory.0: Direct firmware load for regulatory.db failed with error -2
[   46.849451 ] cfg80211: failed to load regulatory.db
[   47.594712 ] systemd-journald[156]: Received client request to flush runtime journal.
[  669.534683 ] Hello world

```

The same happens when we remove the module with `rmmod`, we can see the message `Goodbye world`.

```
root@localhost:~# dmesg | tail
[   43.422468 ] systemd[1]: Starting systemd-networkd.service - Network Configuration...
[   46.219553 ] cfg80211: Loading compiled-in X.509 certificates for regulatory database
[   46.519529 ] systemd[1]: Started systemd-journald.service - Journal Service.
[   46.829940 ] Loaded X.509 cert 'sforshee: 00b28ddf47aef9cea7'
[   46.844600 ] Loaded X.509 cert 'wens: 61c038651aabdcf94bd0ac7ff06c7248db18c600'
[   46.848407 ] platform regulatory.0: Direct firmware load for regulatory.db failed with error -2
[   46.849451 ] cfg80211: failed to load regulatory.db
[   47.594712 ] systemd-journald[156]: Received client request to flush runtime journal.
[  669.534683 ] Hello world
[  852.658073 ] Goodbye world
```

Alternatively, using `modprobe` worked exactly the same. Although `modprobe` seemed easier to use.

> Interesting fact: I was questioning the difference between both programs. By running `man insmod` we can see that `modprobe` should be the prefered one:
> 
> ```
> DESCRIPTION
> insmod is a trivial program to insert a module into the kernel.
> Most users will want to use modprobe(8) instead, which is more
> clever and can handle module dependencies.
> ```


## 5. Dependencies between kernel features

Here I changed my example module to have the following code.

```c
#include <linux/module.h>
#include <linux/init.h>

void simple_mod_func(void);

void simple_mod_func(void)
{
    pr_info("Called %s, %s function\n", KBUILD_MODNAME, __func__);
}
EXPORT_SYMBOL_NS_GPL(simple_mod_func, "IIO_WORKSHOP_SIMPLE_MOD");

static int __init simple_mod_init(void)
{
    pr_info("Hello from %s module\n", KBUILD_MODNAME);
    return 0;
}

static void __exit simple_mod_exit(void)
{
    pr_info("Goodbye from %s module\n", KBUILD_MODNAME);
}

module_init(simple_mod_init);
module_exit(simple_mod_exit);

MODULE_LICENSE("GPL");
```

I rebuilt this module, copied it to the VM and installed/uninstalled the module.

```sh
# @HOST
make -C "$IIO_TREE" M="${IIO_TREE}/drivers/misc/"
scp "${IIO_TREE}/drivers/misc/simple_mod.ko" root@<VM-IP-address>:~/

# @VM
cp simple_mod.ko /lib/modules/`uname -r`/kernel/drivers/misc/
depmod --quick
modprobe simple_mod
modprobe -r simple_mod
```

The new `depmod` command with the `--quick` option seems to  "create a list of module dependencies" and "scan to see if any modules are newer than the modules.dep file before any work is done: if not, it silently exits rather than regenerating the files", as described in its man page.

The result of this is the following.
```
root@localhost:~# dmesg | tail
[   46.848407 ] platform regulatory.0: Direct firmware load for regulatory.db failed with error -2
[   46.849451 ] cfg80211: failed to load regulatory.db
[   47.594712 ] systemd-journald[156]: Received client request to flush runtime journal.
[  669.534683 ] Hello world
[  852.658073 ] Goodbye world
[ 1041.745540 ] Hello world
[ 1053.804522 ] Goodbye world
[ 3916.784470 ] simple_mod: loading out-of-tree module taints kernel.
[ 3916.786524 ] Hello from simple_mod module
[ 3923.974343 ] Goodbye from simple_mod module
```

In this next part, I added a new module `simple_mod_part.c` that will depend on the first one:

```c
#include <linux/module.h>
#include <linux/init.h>

extern void simple_mod_func(void);

static int __init simple_mod_part_init(void)
{
    pr_info("Hello from %s module\n", KBUILD_MODNAME);
    simple_mod_func();
    return 0;
}

static void __exit simple_mod_part_exit(void)
{
    pr_info("Goodbye from %s module\n", KBUILD_MODNAME);
}

module_init(simple_mod_part_init);
module_exit(simple_mod_part_exit);

MODULE_LICENSE("GPL");
MODULE_IMPORT_NS("IIO_WORKSHOP_SIMPLE_MOD");
```

Then I added the following entries to `Kconfig` and `Makefile`:

```conf
# iio/drivers/misc/Kconfig
config SIMPLE_MOD_PART
        tristate "Simple test partner module"
        depends on SIMPLE_MOD
        help
            Enable this configuration option to enable the simple test pattern
            module.
```
```sh
# iio/drivers/misc/Makefile
obj-$(CONFIG_SIMPLE_MOD_PART) += simple_mod_part.o
```

And after that, I just enabled the module with `make menuconfig` and built the modules, copying it to the vm, with:
```sh
make -C "$IIO_TREE" modules_prepare
make -C "$IIO_TREE" M=drivers/misc/
scp "${IIO_TREE}/drivers/misc/simple_mod_part.ko" root@<VM-IP-address>:~/
```

Inside the VM, we can copy and load the new module:

```sh
cp simple_mod_part.ko /lib/modules/`uname -r`/kernel/drivers/misc/
depmod --quick
modinfo simple_mod_part
modprobe simple_mod_part
modprobe -r simple_mod_part
dmesg | tail
```

This was the result.

```
root@localhost:~# dmesg | tail
[ 1041.745540 ] Hello world
[ 1053.804522 ] Goodbye world
[ 3916.784470 ] simple_mod: loading out-of-tree module taints kernel.
[ 3916.786524 ] Hello from simple_mod module
[ 3923.974343 ] Goodbye from simple_mod module
[ 5180.974985 ] Hello from simple_mod module
[ 5180.979421 ] Hello from simple_mod_part module
[ 5180.979778 ] Called simple_mod, simple_mod_func function
[ 5191.205356 ] Goodbye from simple_mod_part module
[ 5191.217908 ] Goodbye from simple_mod module
```

We can see that `simple_mod` was automatically loaded. That's probably one difference between `insmod` and `modprobe`.

