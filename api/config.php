<?php
/* ============================================================
   LondonRental.ca — settings
   ------------------------------------------------------------
   The ONLY thing you may want to change here is the admin
   password below. Pick something strong and keep it private.
   This file runs on the server and is NEVER shown to visitors.
   ============================================================ */

$ADMIN_PASSWORD = '251201Kt!';   // <-- your admin password (lives only on the server, never shown to visitors)

/* Where data + uploaded photos live (you normally don't touch these) */
$DATA_FILE  = __DIR__ . '/../data/listings.json';   // the shared listings
$UPLOAD_DIR = __DIR__ . '/../uploads/listings';      // where photos are saved on disk
$UPLOAD_URL = 'uploads/listings';                    // the public web path to those photos
