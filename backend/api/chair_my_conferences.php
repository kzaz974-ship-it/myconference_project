<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { http_response_code(200); exit; }

require_once __DIR__ . "/../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);
$userId = (int)($data["userId"] ?? 0);

if ($userId <= 0) {
  http_response_code(400);
  echo json_encode(["success" => false, "message" => "Missing userId"]);
  exit;
}

try {
  // تأكد role = chair
  $chk = $pdo->prepare("SELECT role FROM users WHERE id_user=?");
  $chk->execute([$userId]);
  $u = $chk->fetch(PDO::FETCH_ASSOC);
  if (!$u || $u["role"] !== "chair") {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Organizer only"]);
    exit;
  }

  $st = $pdo->prepare("
    SELECT id_conf, titre, description, date_debut, date_fin
    FROM conferences
    WHERE created_by = ?
    ORDER BY id_conf DESC
  ");
  $st->execute([$userId]);
  $confs = $st->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode(["success" => true, "conferences" => $confs]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["success" => false, "message" => "Server error"]);
}
