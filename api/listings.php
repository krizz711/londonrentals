<?php
/* The shared listings store.
   GET           -> { "version": "...", "listings": [ ... ] }
   GET ?meta=1   -> { "version": "..." }                  (cheap change-check for polling)
   POST {action:"save", listings:[...]}  (admin only) -> { "ok": true, "version": "..." } */

require __DIR__ . '/_bootstrap.php';

function load_listings($file) {
  if (!is_file($file)) return array();
  $raw = file_get_contents($file);
  $d = json_decode($raw, true);
  return is_array($d) ? $d : array();
}

/* version = file modification time; changes whenever listings are saved */
function data_version($file) {
  clearstatcache(true, $file);
  return is_file($file) ? (string)filemtime($file) : '0';
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
  if (isset($_GET['meta'])) {
    json_out(array('version' => data_version($DATA_FILE)));
  }
  json_out(array(
    'version'  => data_version($DATA_FILE),
    'listings' => load_listings($DATA_FILE),
  ));
}

if ($method === 'POST') {
  require_same_origin();
  if (!is_admin()) json_out(array('ok' => false, 'error' => 'unauthorized'), 401);

  $body = read_body_json();
  if (!isset($body['action']) || $body['action'] !== 'save'
      || !isset($body['listings']) || !is_array($body['listings'])) {
    json_out(array('ok' => false, 'error' => 'bad_request'), 400);
  }

  $dir = dirname($DATA_FILE);
  if (!is_dir($dir)) @mkdir($dir, 0775, true);

  $json = json_encode($body['listings'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
  $ok = file_put_contents($DATA_FILE, $json, LOCK_EX);
  if ($ok === false) json_out(array('ok' => false, 'error' => 'write_failed'), 500);

  json_out(array('ok' => true, 'version' => data_version($DATA_FILE)));
}

json_out(array('ok' => false, 'error' => 'method'), 405);
