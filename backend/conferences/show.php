<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/../config/db.php";

$id = intval($_GET["id"] ?? 0);

if ($id <= 0) {
  http_response_code(400);
  echo json_encode(["success" => false, "message" => "id required"]);
  exit;
}

try {
  $st = $pdo->prepare("
    SELECT id_conf, titre, description, date_debut, date_fin, created_by
    FROM conferences
    WHERE id_conf = ?
    LIMIT 1
  ");
  $st->execute([$id]);
  $row = $st->fetch();

  if (!$row) {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "Not found"]);
    exit;
  }

  echo json_encode(["success" => true, "conference" => $row]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["success" => false, "message" => "Server error", "error" => $e->getMessage()]);
}

