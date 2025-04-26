---
title: 'Making a first patch'
description: 'This report shows how we made a first patch to the Linux kernel'
pubDate: '20 Apr 2025'
---

In this report, we show how we made our first patch for the Linux kernel in the IIO subsystem.

## 1. Setting up the branch
First we ensured that our `testing` branch was updated and we created a new branch for it.

```sh
git pull
git reset --hard origin/testing
git checkout -b accel-sca3000-remove-read-data-short
```

## 2. Developing the patch

After that, we removed the duplicated code, centralized all the shared behavior in one `sca3000_read_data` function.

```c
static int sca3000_read_data(struct sca3000_state *st,
                 u8 reg_address_high,
                 int len)
{
    int ret;
    struct spi_transfer xfer[2] = {
        {
            .len = 1,
            .tx_buf = st->tx,
        }, {
            .len = len,
            .rx_buf = st->rx,
        }
    };

    st->tx[0] = SCA3000_READ_REG(reg_address_high);
    ret = spi_sync_transfer(st->us, xfer, ARRAY_SIZE(xfer));
    if (ret) {
        dev_err(&st->us->dev, "problem reading register\n");
        return ret;
    }

    return 0;
}
```

> Even though we noticed many possible points to improve the code quality of this file, we tried to minimize changes in this patch, since we didn't know the code standards in the project.

After making the changes, we enabled this module and compiled the kernel.

```sh
make ./activate

cd iio
make menuconfig # and enable the module
make -j$(nproc) clean
make -j$(nproc) Image.gz modules
``` 

## 3. Commiting the changes

Then we could finally commit our changes. I ensured I had the correct name and email configuration, and added information about my partner that co-developed the patch.

```sh
git config --global user.name <My Name>
git config --global user.email <my@email.com>

git commit --signoff --trailer='Co-developed-by: My Partner Name <mypartner@email.com>' --trailer='Signed-off-by: My Partner Name <mypartner@email.com>'
```

We wrote the following commit message.

```
iio: accel: sca3000: remove duplicated code in sca3000_read_data

Remove duplicated code between sca3000_read_data and
sca3000_read_data_short functions.

The common behavior is centralized in just one
sca3000_read_data function and used for every
case.

Signed-off-by: My Name <my@email.com>
Co-developed-by: My Partner Name <mypartner@email.com>
Signed-off-by: My Partner Name <mypartner@email.com>
``` 

## 4. Checking for code style problems

To ensure this commit didn't introduce any code style problems to the project, we ran the following command.


```sh
git format-patch -1 --stdout | ./scripts/checkpatch.pl --
```

And this was the result.

```
total: 0 errors, 0 warnings, 238 lines checked

"[PATCH] iio: accel: sca3000: remove duplicated code in" has no obvious style problems and is ready for submission.
```

## 5. Configuring git for sending patches

Patches for the Linux kernel are sent through email. So, we need to configure our git to send them. Since I used a Gmail email provider, the following configurations are based on that.

```sh
git config --global sendemail.smtpuser <my@email.com>
git config --global sendemail.smtpencryption tls
git config --global sendemail.smtpserver smtp.gmail.com
git config --global sendemail.smtpserverport 587
```

I also had to create an app password in [https://myaccount.google.com/security](https://myaccount.google.com/security).

> Although the tutorial suggests the use of a `@usp.br` email (the email of my university), it seems the use of app passwords are disabled. So, I used my personal Gmail for that.

## 6. Sending contributions for internal review
Before sending the contribution for the real mailing lists and maintainers, we sent our contribution the a temporary email of this course for internal review.

```sh
git send-email -1 --suppress-cc=all --cc="my@email.com" --cc="mypartner@email.com" --to=<freesoftwarecourse@email.com>
```

