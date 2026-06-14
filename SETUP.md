# LondonRental.ca — Setup & Hosting Guide

This website now **stores its listings on the server**, so when you add, edit, or
delete a listing in the admin panel, **every visitor sees the change** (the public
site refreshes itself automatically every few seconds).

✅ **No external accounts. No database to set up. No keys to copy.**
Everything it needs is already inside this folder. You just upload it.

**Requirement:** a web host that supports **PHP** — Hostinger includes this on all
normal web-hosting plans, so you're good.

---

## Deploy on Hostinger (about 5 minutes)

1. Log in to **Hostinger** → open **hPanel**.
2. Open **File Manager** (under *Files*).
3. Go into the **`public_html`** folder (this is your website's main folder).
   - If you're replacing an old version, delete the old files there first.
4. Upload the project **ZIP**, then **right-click it → Extract**.
   - ⚠️ Make sure the files land **directly inside `public_html`** — you should see
     `index.html`, `app.js`, the `api` folder, the `data` folder, etc. right there
     (NOT inside an extra `project` sub-folder). If they ended up in a sub-folder,
     move them up one level.
5. Delete the leftover `.zip` file.
6. Visit your domain — **https://londonrental.ca** — the site is live. 🎉

> The homepage is **`index.html`** (this is what a web address opens by default).

---

## Set your admin password

1. In **File Manager**, open the **`api`** folder → right-click **`config.php`** → **Edit**.
2. Change this line to your own password:
   ```php
   $ADMIN_PASSWORD = 'kunal2025';   // <-- put your own password here
   ```
3. **Save**. That's it — this password lives only on the server and is never shown
   to visitors.

---

## How to manage your listings

1. Go to **https://londonrental.ca/#admin-kunal**
2. Enter your admin password.
3. Add / Edit / Delete listings, upload photos, mark them *Available* or *Rented*.
4. **Changes are saved to the website and appear for everyone** within a few seconds
   — no need to tell anyone to refresh.

**Test it:** open the site on your **phone** while you edit a listing on your
**computer**. The phone updates on its own within ~10 seconds.

---

## What changed vs. the old version

| | Before | Now |
|---|---|---|
| Admin edits | Only **you** saw them (saved in your own browser) | **Saved on the server — everyone sees them** |
| Listing photos | — | Uploaded photos are stored on your hosting |
| Admin password | Hidden in the page code | Lives safely on the server (`api/config.php`) |
| Landlord "Submit Property" form | Tried (and failed) to attach photos to email | Photo upload removed; it sends the details by email cleanly |

---

## Troubleshooting

- **Homepage shows a list of files, or "404 / Index of /"** → the files are inside an
  extra sub-folder. In File Manager, move everything so `index.html` sits *directly*
  in `public_html`.
- **"Could not save" when editing** → either you're not signed in (re-open
  `#admin-kunal` and enter the password), or the `data` folder isn't writable. To fix
  permissions: in File Manager, right-click the **`data`** folder → **Permissions** →
  set to **755** (do the same for **`uploads`** and **`uploads/listings`**).
- **Uploaded photos don't appear** → the **`uploads/listings`** folder isn't writable;
  set its Permissions to **755** as above.
- **Changes don't appear on another device** → they show within ~10 seconds or on a
  refresh. Make sure you're viewing the real website (not a file opened from your
  computer).
- **Want a different secret admin link** (instead of `#admin-kunal`)? Open `admin.js`
  in File Manager and change the line `const SECRET_HASH = '#admin-kunal';` to your own,
  e.g. `'#manage-2026'`. Then use `londonrental.ca/#manage-2026`.

---

## For developers (folder map)

```
index.html            the website (homepage)
app.js                listings grid + data layer (talks to /api)
admin.js              password-gated admin panel
modals.js  fx.js      inquiry/landlord forms + animations
assets/               css, images, fonts
api/
  config.php          ← admin password + paths (the only file you edit)
  login.php           sign in / out, session check
  listings.php        read all listings (public) / save all (admin only)
  upload.php          save an admin-uploaded photo (admin only)
  _bootstrap.php      shared helpers
data/
  listings.json       the shared listings (auto-updated by the admin panel)
uploads/listings/     uploaded listing photos (kept out of code execution)
```

**How it works:** the public page `GET`s `api/listings.php` and then polls
`api/listings.php?meta=1` every 10s; if the data changed it re-fetches and re-renders.
The admin signs in via `api/login.php` (PHP session) and saves the whole list via
`POST api/listings.php`. If the API is ever unreachable (e.g. opened as a local file),
the site automatically falls back to `localStorage` so it still works offline.
