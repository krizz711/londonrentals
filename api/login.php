<?php
/* Admin sign-in / sign-out / status.
   GET            -> { "admin": true|false }
   POST {password}-> { "ok": true } and starts an admin session
   POST {action:"logout"} -> { "ok": true } */

require __DIR__ . '/_bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
  json_out(array('admin' => is_admin()));
}

if ($method === 'POST') {
  require_same_origin();
  $body = read_body_json();

  if (isset($body['action']) && $body['action'] === 'logout') {
    $_SESSION = array();
    session_destroy();
    json_out(array('ok' => true));
  }

  $pass = isset($body['password']) ? (string)$body['password'] : '';
  if ($pass !== '' && hash_equals((string)$ADMIN_PASSWORD, $pass)) {
    session_regenerate_id(true);
    $_SESSION['lr_admin'] = true;
    json_out(array('ok' => true));
  }
  json_out(array('ok' => false, 'error' => 'bad_password'), 401);
}

json_out(array('ok' => false, 'error' => 'method'), 405);
