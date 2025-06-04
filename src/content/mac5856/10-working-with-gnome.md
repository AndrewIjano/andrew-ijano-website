---
title: '[GNOME] Working better with GNOME'
description: 'Working better with GNOME'
pubDate: '03 Jun 2025'
---

## [Issue \#1 - AGAIN] Colors panel: there is an extra line below the device name 

> [Issue 1644](https://gitlab.gnome.org/GNOME/gnome-control-center/-/issues/1644)

By discussing this further with Alice, one of the maintainers, it seemed that making a workaround for this problem wouldn't be an issue. So we progressed by chaning the visibility not only of the child but of the row itself in the filter function and [made a MR for that](https://gitlab.gnome.org/GNOME/gnome-control-center/-/merge_requests/3146).

```diff
@@ -1908,13 +1908,18 @@ cc_color_panel_filter_func (GtkListBoxRow *row, void *user_data)
 {
   CcColorPanel *self = CC_COLOR_PANEL (user_data);
   g_autoptr(CdDevice) device = NULL;
+  gboolean is_visible;

   /* always show all devices */
   if (CC_IS_COLOR_DEVICE (row))
     return TRUE;

   g_object_get (row, "device", &device, NULL);
-  return g_strcmp0 (cd_device_get_id (device), self->list_box_filter) == 0;
+  is_visible = g_strcmp0 (cd_device_get_id (device), self->list_box_filter) == 0;
+
+  /* workaround to remove extra line at the end of a row */
+  gtk_widget_set_visible (GTK_WIDGET (row), is_visible);
+  return is_visible;
}

```

![](/gnome-color-line-mr.png)

The MR was readily reviewed, aproved and merged, being picked for GNOME 47.

In the discussion about this MR, it was pointed that the problem happens in other places too. So I created a [new issue](https://gitlab.gnome.org/GNOME/gnome-control-center/-/issues/3461) so that other newcommers can contribute to it.

![](/gnome-color-line-new-issue.png)

## [Issue \#4] Apps panel: File & Link associations doesn't show any feedback when removing a file type
> [Issue 2867](https://gitlab.gnome.org/GNOME/gnome-control-center/-/issues/2867)

This issue was related to the file & link associations not showing any feedback when removing a file type. We solved that by creating a toast that popup at every removal and could undo the changes if clicked. We [created an MR for that](https://gitlab.gnome.org/GNOME/gnome-control-center/-/merge_requests/3156) and is still under discussion.


![](/gnome-apps-feedback-mr.png)

## [Issue \#5] Keyboards and Systems panels: keyboard layout dialog doesn't fit 
> [Issue 3390](https://gitlab.gnome.org/GNOME/gnome-control-center/-/issues/3390)

This issue was causing the keyboard list to don't fit correctly in the dialog. Since the dialog seems to have a standardized fixed size, the possible solutions relied on limiting the items in the list. We could remove elements from the shared "initial languages" list in the project, but we decided to implement a logic that makes this limit only when the available languages are above the maximum.

This was done not only for the keyboards panel but for the systems panel too.

```diff
- row = cc_language_row_new (locale_ids[i]);
+ is_initial = (g_hash_table_lookup (initial, locale_ids[i]) != NULL);
+ cc_language_row_set_is_extra (row, !is_initial);
+ is_extra = !is_initial || initial_languages_count >= MAX_INITIAL_LANGUAGES;
+ if (!is_extra)
+        initial_languages_count++;
+
+ cc_language_row_set_is_extra (row, is_extra);
  gtk_list_box_prepend (self->language_listbox, GTK_WIDGET (row));

```

We [made a MR for that](https://gitlab.gnome.org/GNOME/gnome-control-center/-/merge_requests/3160) which is still under discussion.

![](/gnome-keyboard-mr.png)
