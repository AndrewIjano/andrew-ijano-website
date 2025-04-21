---
title: 'Finding patch candidates'
description: 'This report shows how we managed to find patch candidates for the Linux kernel'
pubDate: '17 Apr 2025'
---

After several tutorials about the Linux kernel, we were ready to make our first patch. To make this process easier, we had a [list](https://pad.riseup.net/p/MAC0470-iio-patch-keep) of several patch suggestions to choose from. The options related to remove duplicated code seemed the most interesting for several reasons:

- It's usually a good contribution for the code quality;
- It's a good way to learn how the code works;
- We don't need to have specialized hardware to test the behavior.

From the provided list, we searched for good candidates for refactoring. When dealing with duplicated code, one approach is looking for functions that have a similar name, which could indicate that they have shared behavior to extract. Using this logic, we found three good candidates:
1. Duplicated code in `magnetometer/bmc150_magn.c` between functions `bmc150_magn_compensate_x` and `bmc150_magn_compensate_y`;
2. Duplicated code in `accel/sca3000.c` between functions `sca3000_read_data` and `sca3000_read_data_short`;
3. Duplicated code in `chemical/sunrise_co2.c` between functions `sunrise_cal_background_write` and `sunrise_cal_factory_write`.

The second one was the most promissing, since both functions were really duplicating behavior:

```c
// accel/sca3000.c
static int sca3000_read_data_short(struct sca3000_state *st,
                   u8 reg_address_high,
                   int len)
{
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

    return spi_sync_transfer(st->us, xfer, ARRAY_SIZE(xfer));
}
// ...
static int sca3000_read_data(struct sca3000_state *st,
                 u8 reg_address_high,
                 u8 *rx,
                 int len)
{
    int ret;
    struct spi_transfer xfer[2] = {
        {
            .len = 1,
            .tx_buf = st->tx,
        }, {
            .len = len,
            .rx_buf = rx,
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

In the next article, we're going to describe the process of making a patch to remove this duplicated code.