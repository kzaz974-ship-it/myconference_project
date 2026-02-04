<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { http_response_code(200); exit(); }

require_once __DIR__ . "/../config/db.php"; // تأكدي اسم الملف db.php

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  echo json_encode(["success" => false, "message" => "Method not allowed"]);
  exit();
}

$data = json_decode(file_get_contents("php://input"), true);

$userId = intval($data["userId"] ?? 0);
$titre = trim($data["titre"] ?? "");
$description = trim($data["description"] ?? "");
$date_debut = $data["date_debut"] ?? null;
$date_fin = $data["date_fin"] ?? null;

if ($userId <= 0 || $titre === "") {
  http_response_code(400);
  echo json_encode(["success" => false, "message" => "userId and titre are required"]);
  exit();
}

try {
  $stmt = $pdo->prepare("INSERT INTO conferences (titre, description, date_debut, date_fin, created_by) VALUES (?, ?, ?, ?, ?)");
  $stmt->execute([$titre, $description, $date_debut, $date_fin, $userId]);

  echo json_encode([
    "success" => true,
    "id_conf" => $pdo->lastInsertId()
  ]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["success" => false, "message" => "Server error", "error" => $e->getMessage()]);
}
