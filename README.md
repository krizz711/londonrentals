# 🏠 LondonRental.ca

**🔗 Live Deployment:** [https://londonrental.ca](https://londonrental.ca)

A production-grade, database-less rental listing platform built for a real business owner in London, Ontario — deployed on Hostinger shared hosting with zero database configuration.

---

## 🚀 The Business Problem

A local property management entrepreneur needed a professional rental platform but faced two major pain points:

1. **No database expertise** — Setting up MySQL tables, writing migrations, managing credentials, and handling backups was out of scope for a non-technical business owner.
2. **Ongoing developer dependency** — Every time a listing needed to be added, edited, or marked as rented, they'd have to contact a developer.

**The goal:** Give the owner full control over their listings through a clean admin panel, while keeping the infrastructure dead-simple to deploy and maintain.

---

## 💡 The Solution: A Database-less Architecture

We engineered a complete CRUD platform that replaces traditional database infrastructure with a flat-file JSON approach, powered by custom PHP REST APIs.

### How It Works

```
┌─────────────────┐     HTTPS/JSON      ┌──────────────────┐     Read/Write     ┌─────────────────┐
│   Admin Panel    │ ◄─────────────────► │   PHP REST API   │ ◄───────────────► │ listings.json   │
│   (Browser JS)  │    fetch() calls     │  api/listings.php│   file_get/put    │ data/            │
└─────────────────┘                      └──────────────────┘                    └─────────────────┘
        │                                        │
        │  Photo uploads                         │  Session auth
        ▼                                        ▼
┌─────────────────┐                      ┌──────────────────┐
│  uploads/        │                      │  api/login.php   │
│  listings/*.jpg  │                      │  (cookie-based)  │
└─────────────────┘                      └──────────────────┘
```

1. **Admin Panel** → The owner logs in via a secret URL hash (`#admin-kunal`) + password gate, then manages listings through a full CRUD editor with photo uploads, descriptions, pricing, and status toggling.
2. **PHP API Layer** → Lightweight RESTful endpoints handle authentication, listing persistence, and image uploads — all without a single SQL query.
3. **JSON Flat-File Storage** → All listing data lives in `data/listings.json`. PHP reads and writes it atomically with `LOCK_EX` to prevent race conditions.

---

## 🔧 Technical Deep-Dive

### Why PHP?

PHP was chosen deliberately — not as a legacy default, but as the **optimal tool** for this exact use case:

| Factor | PHP | Node.js / Python |
|---|---|---|
| **Shared hosting support** | ✅ Pre-installed on Hostinger, cPanel, and virtually every shared host | ❌ Requires VPS or specific hosting plans |
| **Zero build step** | ✅ Drop files via FTP/File Manager → it works | ❌ Requires `npm install`, build processes, PM2 |
| **File I/O for JSON storage** | ✅ Native `file_get_contents()` / `file_put_contents()` with `LOCK_EX` | ⚠️ Possible but needs careful async handling |
| **Session-based auth** | ✅ Built-in `$_SESSION` with server-side cookie management | ⚠️ Requires middleware (express-session, etc.) |
| **Cost** | ✅ $0 extra — included in basic hosting | ❌ Often requires $5–20/mo VPS |

**Bottom line:** PHP lets the business owner deploy by dragging files into Hostinger's File Manager. No terminal, no SSH, no `npm install`, no process manager.

### Why No Database?

Traditional databases (MySQL, PostgreSQL) add layers of complexity that this project simply doesn't need:

- **No schema migrations** — The JSON structure *is* the schema. Adding a new field (like `desc`) is just adding a key to the object.
- **No connection pooling** — PHP reads a file, serves the response, and exits. No persistent connections to manage.
- **No credentials to leak** — There's no `DB_PASSWORD` in a `.env` file. The data file is protected by `.htaccess` rules.
- **No backups to configure** — The owner can literally download `listings.json` as a backup. It's a single file.
- **Atomic writes** — `file_put_contents($path, $data, LOCK_EX)` ensures no partial writes, even under concurrent requests.

### API Design

The backend exposes three clean PHP endpoints:

| Endpoint | Method | Purpose |
|---|---|---|
| `api/listings.php` | `GET` | Returns all listings as JSON (with a `version` timestamp for cache-busting) |
| `api/listings.php` | `POST` | Admin-only: saves the full listings array (protected by session + origin check) |
| `api/login.php` | `GET` | Checks if the current session is authenticated |
| `api/login.php` | `POST` | Authenticates with password or logs out |
| `api/upload.php` | `POST` | Handles photo uploads, saves to `uploads/listings/`, returns the URL |

All endpoints share a `_bootstrap.php` that handles CORS headers, JSON I/O helpers, and admin verification via `$_SESSION`.

### Security Measures

Despite the simplicity, security wasn't an afterthought:

- **Server-side password hashing** — The admin password is verified via `password_verify()` against a bcrypt hash stored in `config.php`.
- **Same-origin enforcement** — All mutating API calls check for the `X-Requested-With: fetch` header to block CSRF from external sites.
- **Session-based auth** — No tokens in localStorage. Authentication state lives in an `HttpOnly` server-side session cookie.
- **Upload validation** — `upload.php` validates MIME types and restricts uploads to image formats only.
- **`.htaccess` protection** — The `data/` directory is blocked from direct browser access; only PHP can read the JSON file.

### Frontend Architecture

The frontend is intentionally **framework-free** for maximum performance and zero build complexity:

- **`app.js`** — Core listing engine: fetches listings from the API, renders cards, handles filtering/sorting, and manages the data store (`LR_Store`).
- **`modals.js`** — Multi-step landlord submission wizard, tenant inquiry forms, and the listing detail modal (with photo gallery and embedded Google Maps).
- **`admin.js`** — The full admin CRUD panel: login gate, listing editor with photo upload, and real-time preview.
- **`fx.js`** — Micro-animations and scroll effects for a polished, premium feel.

All JS files are vanilla ES6+ IIFEs — no imports, no bundler, no transpiler. They load in order via `<script>` tags and communicate through `window.LR_Store` and global function hooks.

---

## ✨ Key Features

- 🎨 **Premium, Dark-Mode UI** — Custom design system with gold accents, glassmorphism, and smooth micro-animations.
- 🔐 **Secret Admin Portal** — Hidden behind a URL hash + password gate. No visible "admin" link for visitors.
- 📸 **Photo Gallery & Video** — Multi-image upload with drag-and-drop, URL-based image adding, and MP4 video support.
- 🗺️ **Embedded Google Maps** — Each listing detail modal shows the property location on an interactive map.
- 📬 **Integrated Contact Flows** — Tenant inquiry and landlord submission forms pre-fill a `mailto:` email with all details.
- ⚡ **Change Polling** — The frontend polls `api/listings.php?meta=1` to detect changes and auto-refresh without a full page reload.
- 📱 **Fully Responsive** — Optimized layouts for desktop, tablet, and mobile viewports.

---

## 🛠️ Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Structure** | HTML5 (Semantic) | SEO-friendly, accessible, zero build step |
| **Styling** | Vanilla CSS | Full design control, custom properties, no utility-class bloat |
| **Logic** | Vanilla JavaScript (ES6+) | No framework overhead, instant load, no `node_modules` |
| **Backend** | PHP 7.4+ | Universal shared-hosting support, native file/session handling |
| **Data** | Flat-file JSON | Zero-config, human-readable, trivially portable |
| **Hosting** | Hostinger | Affordable shared hosting with PHP pre-configured |

---

## 📁 Project Structure

```
project/
├── index.html              # Main page (all sections)
├── app.js                  # Listing engine + data store
├── modals.js               # Tenant/landlord modals + detail view
├── admin.js                # Admin CRUD panel
├── fx.js                   # Animations & scroll effects
├── api/
│   ├── _bootstrap.php      # Shared helpers (CORS, JSON, auth)
│   ├── config.php          # Admin password hash + data path
│   ├── listings.php        # GET/POST listings
│   ├── login.php           # Session authentication
│   └── upload.php          # Image upload handler
├── data/
│   └── listings.json       # All listing data (the "database")
├── uploads/
│   └── listings/           # Uploaded property photos
└── assets/                 # Static images, logos, fonts
```

---

## 🚢 Deployment

Deploying to Hostinger (or any PHP shared host) is as simple as:

1. Upload the entire `project/` folder contents to `public_html/` via File Manager or FTP.
2. Edit `api/config.php` to set your admin password hash.
3. Visit `yourdomain.com` — it's live.

No `npm install`. No database setup. No `.env` files. No build step.

---

*Built to empower business owners with simplicity, security, and elegance.*
