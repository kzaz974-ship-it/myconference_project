<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { http_response_code(200); exit; }

require_once __DIR__ . "/../config/db.php";

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

$id_article = isset($data["id_article"]) ? intval($data["id_article"]) : 0;
if (!$id_article) {
  echo json_encode(["success" => false, "message" => "id_article is required"]);
  exit;
}

try {
  // article info
  $st = $pdo->prepare("SELECT id_article, titre, statut FROM articles WHERE id_article=?");
  $st->execute([$id_article]);
  $article = $st->fetch(PDO::FETCH_ASSOC);

  if (!$article) {
    echo json_encode(["success" => false, "message" => "Article not found"]);
    exit;
  }

  // reviews
  $st = $pdo->prepare("
    SELECT 
      r.id_review,
      r.note,
      r.decision,
      r.commentaire,
      r.id_reviewer,
      CONCAT(u.prenom, ' ', u.nom) AS reviewer_name,
      u.email AS reviewer_email
    FROM reviews r
    JOIN users u ON u.id_user = r.id_reviewer
    WHERE r.id_article = ?
    ORDER BY r.id_review DESC
  ");
  $st->execute([$id_article]);
  $reviews = $st->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode([
    "success" => true,
    "article" => $article,
    "reviews" => $reviews
  ]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    "success" => false,
    "message" => "Server error",
    "error" => $e->getMessage()
  ]);
}
