<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { http_response_code(200); exit(); }

require_once __DIR__ . "/../config/db.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  echo json_encode(["success" => false, "message" => "Method not allowed"]);
  exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$userId = intval($data["userId"] ?? 0);

if ($userId <= 0) {
  http_response_code(400);
  echo json_encode(["success" => false, "message" => "userId required"]);
  exit();
}

try {
  $stmt = $pdo->prepare("
    SELECT id_conf, titre, description, date_debut, date_fin
    FROM conferences
    WHERE created_by = ?
    ORDER BY id_conf DESC
  ");
  $stmt->execute([$userId]);
  $confs = $stmt->fetchAll();

  echo json_encode(["success" => true, "conferences" => $confs]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["success" => false, "message" => "Server error", "error" => $e->getMessage()]);
}
