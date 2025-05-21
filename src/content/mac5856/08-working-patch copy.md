---
title: '[Linux] Discussing the patch'
description: 'This report shows how we worked on discussions for the patch to the Linux kernel'
pubDate: '07 May 2025'
---


After the sending the patch to the maintainers, we started discussing with the maintainers and working on their suggestions.

## V1: the original proposal

For the first version of our patch, we received a very short review from Andy, one of the reviewers.

```diff
> Remove duplicated code between sca3000_read_data and
> sca3000_read_data_short functions.
>
> The common behavior is centralized in just one sca3000_read_data
> function and used for every case.

We refer to the functions as func() (mind the parentheses).

...

> +       ret = spi_sync_transfer(st->us, xfer, ARRAY_SIZE(xfer));
> +       if (ret) {
> +               dev_err(&st->us->dev, "problem reading register\n");

> +               return ret;
> +       }
>
> -       return spi_sync_transfer(st->us, xfer, ARRAY_SIZE(xfer));
> +       return 0;

Simply return ret instead of 4 LoCs we get only one.
```

After responding to it, we worked on creating a new version with the changes.


## V2: a cleaner version

For this version, Jonathan, the maintainer, sent a review saying that the function we were trying to improve shouldn't be used at all and could be replaced by functions like `spi_w8r8()`.

```
Look at the helpers that exist for spi sequences like this.
This is an old driver so may not be making full use of newer infrastructure.

In particular a lot of these can probably become spi_w8r8()and
it may make sense to move the SCA3000_READ_REG() to the callers to avoid the
need for these helpers at all.

Note that is not an appropriate change for the large reads though as
spi_write_then_read() bounces all buffers and so would add a copy
to those high(ish) performance paths.
```

We had to fully imerse in how these operations worked and make the appropriate changes.

## V3: changing the scope

After the suggestions, we submitted a new version that changed every case of a 1 byte read to a `spi_w8r8()`, 2 byte read to `spi_w8r16()` and the only case that used larger buffers remained with the internal function. This is one example of the change.

```diff
@@ -412,10 +416,11 @@ static int sca3000_read_ctrl_reg(struct sca3000_state *st,
        ret = sca3000_write_reg(st, SCA3000_REG_CTRL_SEL_ADDR, ctrl_reg);
        if (ret)
                goto error_ret;
-       ret = sca3000_read_data_short(st, SCA3000_REG_CTRL_DATA_ADDR, 1);
+
+       ret = spi_w8r8(st->us, SCA3000_READ_REG(SCA3000_REG_CTRL_DATA_ADDR));
        if (ret)
                goto error_ret;
-       return st->rx[0];
+       return ret;
 error_ret:
        return ret;
 }
```

We then received several comments from Andy, like the following.

```diff
Suggested-by: ? (IIRC Jonathan suggested this, but ignore if I am mistaken)

...

-                       *val = sign_extend32(be16_to_cpup((__be16 *)st->rx) >>
+                       *val = sign_extend32(be16_to_cpu((__be16) ret) >>

This doesn't look good, can you define a proper __be16 variable on
stack and use it instead of ret?
```

## V4: cleaning it even more

This one wasn't received so well. I forgot to CC every stakeholder in the response and forgot to reply to *every* comment from Andy, so it seemed that I just ignored his suggestions.

In the end, Johnathan made several suggestions, like using functions like `spi_w8r16be()` to solve problems mentioned by Andy, better sorting changes and using other functions to clean up the code.

```
This shows the age of the code.  Just return in error paths above rather
than a error_ret: label

Might be a good idea to do a precursor patch tidying up any cases of this
before the one doin gthe spi changes in ehre.

> @@ -432,13 +434,13 @@ static int sca3000_print_rev(struct iio_dev *indio_dev)
>       struct sca3000_state *st = iio_priv(indio_dev);
> 
>       mutex_lock(&st->lock);

Another patch to use guard(mutex)(&st->lock); etc would be help clean this
up by allowing direct return in the error path.
```

Beacause of this, we agreed on breaking this change up in a patch set of three changes:
1. One patch for general style changes, like the removal of error_ret labels;
2. Another patch for spi changes;
3. And another one for using `guard(mutex)(&st->lock)`.

## V5: the WIP patch set

This is still a WIP.