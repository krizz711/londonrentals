<?php
/* Shared helpers for the LondonRental API. Not a public endpoint. */

session_start();
require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function json_out($data, $code = 200) {
  http_response_code($code);
  echo json_encode($data);
  exit;
}

function is_admin() {
  return !empty($_SESSION['lr_admin']);
}

/* Read a JSON request body into an array. */
function read_body_json() {
  $raw = file_get_contents('php://input');
  if (!$raw) return array();
  $d = json_decode($raw, true);
  return is_array($d) ? $d : array();
}

/* Light CSRF guard: only accept writes from our own page.
   (A cross-site form cannot set this header, and we don't allow CORS.) */
function require_same_origin() {
  $xrw = isset($_SERVER['HTTP_X_REQUESTED_WITH']) ? $_SERVER['HTTP_X_REQUESTED_WITH'] : '';
  if ($xrw !== 'fetch') json_out(array('ok' => false, 'error' => 'forbidden'), 403);
}
