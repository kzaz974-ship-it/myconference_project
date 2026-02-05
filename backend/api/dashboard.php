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
  $stmt = $pdo->prepare("SELECT id_user, nom, prenom, email, role, affiliation, country FROM users WHERE id_user=?");
  $stmt->execute([$userId]);
  $user = $stmt->fetch();

  if (!$user) {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "User not found"]);
    exit();
  }

  $confs = $pdo->query("SELECT id_conf, titre, description, date_debut, date_fin, created_by FROM conferences ORDER BY id_conf DESC LIMIT 20")->fetchAll();

  $stmt = $pdo->prepare("SELECT id_article, titre, statut, date_soumission, id_conf FROM articles WHERE id_author=? ORDER BY id_article DESC LIMIT 20");
  $stmt->execute([$userId]);
  $myArticles = $stmt->fetchAll();

  $stmt = $pdo->prepare("SELECT id_conf, titre, date_debut, date_fin FROM conferences WHERE created_by=? ORDER BY id_conf DESC LIMIT 20");
  $stmt->execute([$userId]);
  $myConfs = $stmt->fetchAll();

  $stmt = $pdo->prepare("
    SELECT r.id_registration, c.id_conf, c.titre, c.date_debut, c.date_fin
    FROM registrations r
    JOIN conferences c ON c.id_conf = r.id_conf
    WHERE r.id_user=?
    ORDER BY r.id_registration DESC LIMIT 20
  ");
  $stmt->execute([$userId]);
  $myRegs = $stmt->fetchAll();

  echo json_encode([
    "success" => true,
    "user" => $user,
    "conferences" => $confs,
    "myArticles" => $myArticles,
    "myConferences" => $myConfs,
    "myRegistrations" => $myRegs
  ]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["success" => false, "message" => "Server error", "error" => $e->getMessage()]);
}
