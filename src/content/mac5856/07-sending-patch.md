---
title: 'Sending a first patch'
description: 'This report shows how we sent a patch to the Linux kernel'
pubDate: '23 Apr 2025'
---

In this report, we show how we sent our first patch for the Linux kernel in the IIO subsystem.


After the approval from the internal reviwers of our course, the patch is ready for submission. First we got all the maintainers related to our commit.

```sh
git format-patch -1 --stdout | ./scripts/get_maintainer.pl --
```

The result list is something in this structure.

```
Maintainer Name <maintainer@email.com> (maintainer:IIO SUBSYSTEM AND DRIVERS,commit_signer:3/4=75%)
Reviewer 1 Name <reviewer1@email.com> (reviewer:IIO SUBSYSTEM AND DRIVERS,authored:1/4=25%)
Reviewer 2 Name <reviewer2@email.com> (reviewer:IIO SUBSYSTEM AND DRIVERS)
Reviewer 3 Name <reviewer3@email.com> (reviewer:IIO SUBSYSTEM AND DRIVERS,commit_signer:1/4=25%)
Commit Signer 1 Name <commit_signer1@email.com> (commit_signer:2/4=50%,authored:2/4=50%,added_lines:3/37=8%,removed_lines:3/56=5%)
My Name <my@email.com> (commit_signer:1/4=25%,authored:1/4=25%,added_lines:33/37=89%,removed_lines:52/56=93%)
My Partner Name <mypartnert@email.com> (commit_signer:1/4=25%)
openlist1@email.com (open list:IIO SUBSYSTEM AND DRIVERS)
openlist2@email.com (open list)

```

After that, we structured the `send-email` command, like in the previous post, but with the real maintainter and reviewers.

```sh
git send-email -1 --suppress-cc=all \
    --to=<maintainer@email.com> \
    --cc=<my@email.com> \
    --cc=<mypartnert@email.com> \
    --cc=<reviewer1@email.com> \
    --cc=<reviewer2@email.com> \
    --cc=<reviewer3@email.com> \
    --cc=<commit_signer1@email.com> \
    --cc=<openlist1@email.com> \
    --cc=<openlist2@email.com>
```

Then, the patch was submitted and is waiting for approval.
