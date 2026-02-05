<?php
header("Content-Type: application/json; charset=utf-8");

$host = "127.0.0.1";
$db   = "easychair_db";
$user = "root";
$pass = "";
$charset = "utf8mb4";

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

try {
  $pdo = new PDO($dsn, $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
  ]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["success" => false, "message" => "DB connection failed", "error" => $e->getMessage()]);
  exit();
}
