<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

require_once __DIR__ . "/../config/db.php";

try {
  $st = $pdo->prepare("
    SELECT id_user, prenom, nom, email
    FROM users
    WHERE role='reviewer'
    ORDER BY prenom ASC, nom ASC
  ");
  $st->execute();
  $reviewers = $st->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode(["success" => true, "reviewers" => $reviewers]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["success" => false, "message" => "Server error", "error" => $e->getMessage()]);
}

