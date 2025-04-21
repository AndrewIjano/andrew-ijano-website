---
title: 'Building and booting a custom Linux kernel'
description: 'This is the report about the second tutorial for the Linux Kernel development: Building and booting a custom Linux kernel for ARM'
pubDate: 'Mar 12 2025'
---

This is the report about the second tutorial for the Linux Kernel development: [Building and booting a custom Linux kernel for ARM](https://flusp.ime.usp.br/kernel/build-linux-for-arm/).  

## 1. Cloning the Linux tree

For building a custom kernel, we need to choose a Linux tree. In this tutorial, we chose the [IIO subsystem tree](https://git.kernel.org/pub/scm/linux/kernel/git/jic23/iio.git/).

We cloned this tree from the `testing` branch and added the `./iio` folder as an env var in our activation script.

```sh
git clone git://git.kernel.org/pub/scm/linux/kernel/git/jic23/iio.git "${IIO_TREE}" --branch testing --single-branch --depth 10
```

## 2. Configuring the Linux kernel compilation

With the cloned repository, we added `export ARCH=arm64` to our `activate` script and setup our module configuration for this architecture.

```sh
make defconfig
make olddefconfig
ls -alFh .config"
```

> Although that's how the tutorial suggested, I believe that `make olddefconfig` wouldn´t make much effect after a `make defconfig`, since they have a similar behavior and the only difference is that `defconfig` overwrites everything and `olddefconfig` only changes configuration of new modules.

Then we could start libvirt daemon and default network and start an instance with an attaching console.
```sh
sudo systemctl start libvirtd
sudo virsh net-start default
sudo virsh start --console arm64
```
We could see that the VM is running successfully.

After that, we could fetch the `vm_mod_list` from the previous tutorial and save it locally, also adding a `export LSMOD="${IIO_TREE}/vm_mod_list"` to the script.

```sh
sudo virsh net-dhcp-leases default
scp root@<VM-IP-address>:~/vm_mod_list "${IIO_TREE}"
```

With the saved list of modules, we could change our `.config` applying the configuration from the VM.

```sh
make localmodconfig
```

After that, we accessed the `ncofig` menu to add a custom name for our kernel.

```sh
make nconfig
```

## 3. Bulding a custom Linux kernel

To build this custom kernel, we needed the correct compiler for this archtecture, also adding `export CROSS_COMPILE=aarch64-linux-gnu-` to the script.

```sh
sudo pacman -Syy && sudo pacman -S aarch64-linux-gnu-gcc
```

With everything configured, we could, then, compile our kernel.

```sh
make -j$(nproc) Image.gz modules
```

This process took a lot of time!

## 4. Installing modules and booting the custom-built Linux kernel

After that, we just needed to install this modules into the VM and boot the custom kernel. We did that by adding `export VM_MOUNT_POINT="${VM_DIR}/arm64_rootfs"` and `export INSTALL_MOD_PATH="$VM_MOUNT_POINT"` to the script. Also, we mounted the VM and defined the image from our custom kernel as the kernel for the VM.

```sh
mkdir "$VM_MOUNT_POINT"
sudo guestmount --rw --add "${VM_DIR}/arm64_img.qcow2" --mount /dev/sda2 "${VM_MOUNT_POINT}"
sudo --preserve-env make -C "${IIO_TREE}" modules_install
sudo guestunmount "$VM_MOUNT_POINT"

```

Then we created a new VM from this configuration.

```sh
sudo virsh undefine arm64
create_vm_virsh
```

When runinng the following command in the VM, we could see that it was using the custom kernel.

```sh
uname --kernel-release
```