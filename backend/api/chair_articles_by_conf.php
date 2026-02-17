<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { http_response_code(200); exit; }

require_once __DIR__ . "/../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);
$confId = (int)($data["confId"] ?? 0);

if ($confId <= 0) {
  http_response_code(400);
  echo json_encode(["success" => false, "message" => "confId is required"]);
  exit;
}

try {
  $stmt = $pdo->prepare("
    SELECT 
      a.id_article, a.titre, a.resume, a.fichier_pdf,
      a.statut, a.date_soumission, a.id_conf, a.id_author,
      u.prenom AS author_prenom, u.nom AS author_nom, u.email AS author_email
    FROM articles a
    LEFT JOIN users u ON u.id_user = a.id_author
    WHERE a.id_conf = ?
    ORDER BY a.date_soumission DESC, a.id_article DESC
  ");
  $stmt->execute([$confId]);
  $articles = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode(["success" => true, "articles" => $articles]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["success" => false, "message" => "Server error", "error" => $e->getMessage()]);
}
