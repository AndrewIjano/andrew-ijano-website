---
title: '[GNOME] Finding issues for GNOME'
description: 'Finding issues for GNOME'
pubDate: '14 May 2025'
---

## [Issue \#1] Colors panel: there is an extra line below the device name 

> [Issue 1644](https://gitlab.gnome.org/GNOME/gnome-control-center/-/issues/1644)

This seemed a very simple problem to start developing on GNOME. Basically, there's an extra line below de device name in the colors panel.

![](/gnome-color-line.png) 

However, after futher investigation, this seemed a problem with GTK itself and other contributors tried to work on it without success. Because of that, we moved on to another issue.


## [Issue \#2] Network panel: connection editor too small when creating new VPN

> [Issue 2884](https://gitlab.gnome.org/GNOME/gnome-control-center/-/issues/2884)

For this problem, we tried to understand how this settings work. We identified that in the current version most of the problem was caused by a misplaced field in one type of VPN configurations. So, [we made a MR](https://gitlab.gnome.org/GNOME/NetworkManager-openconnect/-/merge_requests/76) to fix that, although the project itself seems abandoned.

![](/gnome-network-mr.png) 


## [Issue \#3] Apps panel: can't easily distinguish identically-named default apps without their icons 
> [Issue 3378](https://gitlab.gnome.org/GNOME/gnome-control-center/-/issues/3378)

For the next issue, we tried to work on understand this problem. However, it seemed that the current Adwaita component didn't support this feature, so we wouldn't be able to fix that within the project. So, we created a comment in the issue to alert about that.

![](/gnome-apps-comment.png)