<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/../config/db.php";

try {
  $st = $pdo->query("
    SELECT id_conf, titre, description, date_debut, date_fin, created_by
    FROM conferences
    ORDER BY date_debut DESC, id_conf DESC
  ");
  echo json_encode(["success" => true, "conferences" => $st->fetchAll()]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["success" => false, "message" => "Server error", "error" => $e->getMessage()]);
}

