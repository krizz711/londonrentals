<?php
/* Save an admin-uploaded listing photo to the server.
   POST {image:"data:image/png;base64,..."}  (admin only)
     -> { "ok": true, "url": "uploads/listings/xxxx.png" }
   Only image data is accepted, and it is re-saved as a plain image
   file with a random name (it can never be executed as a script). */

require __DIR__ . '/_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(array('ok' => false, 'error' => 'method'), 405);
require_same_origin();
if (!is_admin()) json_out(array('ok' => false, 'error' => 'unauthorized'), 401);

$body = read_body_json();
$img  = isset($body['image']) ? (string)$body['image'] : '';

if (strpos($img, 'data:') !== 0 ||
    !preg_match('#^data:image/(png|jpe?g|webp|gif);base64,#i', $img, $m)) {
  json_out(array('ok' => false, 'error' => 'bad_type'), 400);
}

$ext = strtolower($m[1]);
if ($ext === 'jpeg') $ext = 'jpg';

$comma = strpos($img, ',');
$bin = base64_decode(substr($img, $comma + 1), true);
if ($bin === false) json_out(array('ok' => false, 'error' => 'bad_data'), 400);
if (strlen($bin) > 6 * 1024 * 1024) json_out(array('ok' => false, 'error' => 'too_big'), 413); // 6 MB cap

/* Double-check the bytes really are an image */
$info = @getimagesizefromstring($bin);
if ($info === false) json_out(array('ok' => false, 'error' => 'not_image'), 400);

if (!is_dir($UPLOAD_DIR)) @mkdir($UPLOAD_DIR, 0775, true);

$name = 'l' . bin2hex(random_bytes(8)) . '.' . $ext;
$path = $UPLOAD_DIR . '/' . $name;
if (file_put_contents($path, $bin) === false) json_out(array('ok' => false, 'error' => 'write_failed'), 500);

json_out(array('ok' => true, 'url' => $UPLOAD_URL . '/' . $name));
