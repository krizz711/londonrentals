# LondonRental.ca

**Live Deployment:** [https://londonrental.ca](https://londonrental.ca)

A highly optimized, aesthetic, and fully dynamic real estate rental platform built with modern web technologies, specifically designed for shared hosting environments like Hostinger.

## 🚀 The Business Problem Solved

The business owner needed a premium, high-performing rental listing platform but wanted to avoid the overhead, maintenance, and setup complexity associated with traditional SQL databases (like MySQL or PostgreSQL). They needed an intuitive way to manage property listings without relying on a developer for every update.

## 💡 The Solution: A Database-less Architecture

We built a solution that entirely eliminates the need for a traditional database, saving time, reducing server overhead, and making deployment incredibly easy:

1. **Intuitive Admin Panel**: The owner can log in to a secure admin portal to Add, Edit, and Delete rental listings. It supports uploading photos, adding descriptions, setting prices, and toggling availability.
2. **Flat-File JSON Storage via PHP APIs**: Instead of a complex database, the listings are managed via custom **PHP REST APIs** that securely read and write data to a lightweight `listings.json` file.
3. **Optimized for Shared Hosting (Hostinger)**: By relying on built-in PHP capabilities and flat-file data handling, the project can be deployed instantly on Hostinger without executing any SQL dumps or configuring database credentials. It works perfectly right out of the box.

## ✨ Key Features

- **Beautiful, Premium Frontend**: Crafted using vanilla HTML, CSS, and JS to ensure blazing-fast performance, deep customizations, and zero framework bloat.
- **Dynamic Property Engine**: Listings are dynamically fetched on load via the `api/listings.php` endpoint.
- **Integrated Contact Flows**: Built-in tenant inquiry forms and landlord property submission modals.
- **Photo Uploads**: The admin panel allows the owner to drop in photos, which the PHP backend securely saves to an `uploads/` directory.

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla JavaScript (ES6+), Vanilla CSS (Custom Design System).
- **Backend**: PHP 7/8 (Lightweight API routing, JSON handling, Authentication).
- **Data Storage**: Flat-file JSON (`data/listings.json`).
- **Deployment Target**: Hostinger Shared/Cloud Hosting.

---
*Built to empower business owners with simplicity and elegance.*
