<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

require_once __DIR__ . "/../../config/db.php";

try {
  $st = $pdo->query("
    SELECT id_conf, titre, description, date_debut, date_fin, created_by
    FROM conferences
    ORDER BY id_conf DESC
  ");

  $rows = $st->fetchAll();

  echo json_encode([
    "success" => true,
    "conferences" => $rows
  ]);

} catch (Exception $e) {
  http_response_code(500);

  echo json_encode([
    "success" => false,
    "message" => "Server error",
    "error" => $e->getMessage()
  ]);
}
