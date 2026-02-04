<?php

// ✅ CORS for Expo Web
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { http_response_code(200); exit(); }
header("Content-Type: application/json; charset=UTF-8");


// Allow preflight
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
  http_response_code(200);
  exit();
}

// JSON response
header("Content-Type: application/json; charset=UTF-8");

// Show errors (DEV only)
ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);
error_reporting(E_ALL);

// DB config
$host = "localhost";
$db   = "easychair_db";
$user = "root";
$pass = ""; // إذا عندك password فـ MySQL ديرو هنا
$charset = "utf8mb4";

try {
  $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
  $pdo = new PDO($dsn, $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    "success" => false,
    "message" => "DB connection failed",
    "error" => $e->getMessage()
  ]);
  exit();
}
