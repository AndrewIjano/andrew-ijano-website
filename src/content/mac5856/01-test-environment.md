---
title: 'Setting up a test environment'
description: 'This is the report about the first tutorial for the Linux Kernel development: Setting up a test environment for Linux Kernel Dev using QEMU and libvirt'
pubDate: '05 Mar 2025'
---

This is the report about the first tutorial for the Linux Kernel development: [Setting up a test environment for Linux Kernel Dev using QEMU and libvirt](https://flusp.ime.usp.br/kernel/qemu-libvirt-setup/).

To develop the Linux Kernel, the first thing we need to do is setting up our test environment. This was done in several steps.

## 0. Installing dependencies

First, I needed to install all the required dependencies for it, through `pacman`, since I use the Manjaro distro. 

```sh
sudo pacman -Syy && sudo pacman -S qemu-full libvirt virt-install guestfs-tools wget
```

QUEMU (Quick Emulator) will be used to run VMs and libvirt, as a toolkit to manage virtualization platforms, will provide tools to interact with VMs.

## 1. Testing environment directory and script

After that, I created a separated directoy and attributed it to the `libvirt-qemu` group.

```sh
sudo mkdir /home/lk_dev
sudo chown -R libvirt-qemu:libvirt-qemu /home/lk_dev
sudo chmod -R 2770 /home/lk_dev
sudo usermod -aG libvirt-qemu "$USER"
```

In this folder, I created the script that will be used to host environment variables and common functions for further developments.

```sh
touch '/home/lk_dev/activate.sh'
chmod +x '/home/lk_dev/activate.sh'
```

This is the initial content of the script.

```sh
#!/usr/bin/env bash

# environment variables
export LK_DEV_DIR='/home/lk_dev' # path to testing environment directory

# prompt preamble
prompt_preamble='(LK-DEV)'

# colors
GREEN="\e[32m"
PINK="\e[35m"
BOLD="\e[1m"
RESET="\e[0m"

# launch Bash shell session w/ env vars defined
echo -e "${GREEN}Entering shell session for Linux Kernel Dev${RESET}"
echo -e "${GREEN}To exit, type 'exit' or press Ctrl+D.${RESET}"
exec bash --rcfile <(echo "source ~/.bashrc; PS1=\"\[${BOLD}\]\[${PINK}\]${prompt_preamble}\[${RESET}\] \$PS1\"")
```

> On a side note, I tried to modify the script to use the zsh shell instead of bash, that way I could use the autocomplete capabilities of it. However, I couldn't make it work.

After that, I ran the script with `/home/lk_dev/activate.sh` and had it active for the following sections.

## 2. Configuring a VM

We need a virtual machine to test our modified kernel versions. Since the tutorial focuses in the IIO (Industrial I/O) subsystem, we chose a Debian image with ARM 64-bit architecture: `http://cdimage.debian.org/cdimage/cloud/bookworm/daily/20250217-2026/debian-12-nocloud-arm64-daily-20250217-2026.qcow2`.

Then I followed all the steps for configuring the VM, which consists of:
1. Downloading the disk image in a new folder;
2. Resizing the disk image `rootfs`;
3. Extracting the `kernel` and `initrd` images from the guest OS and launching the VM;
4. Using libvirt to make the VM management easier.

## 3. Configuring SSH access
After successfully booting the VM, we had to configure SSH access to make file transfer easier.

> In this part I had some problems when setting up the SSH server, since the VM didn´t seem to have all the needed dependencies installed. Because of it, I had fix the firewall configurations, allowing the VM to connect to the internet and then install the needed dependencies.

## 4. Fetching the list of loaded modules

Then, with the SSH access configured, I fetched the list of loaded modules in the VM, which will be used in the following parts of the tutorial. 

```sh
# @host
ssh root@<VM-IP-address>
# @VM
lsmod > vm_mod_list
```