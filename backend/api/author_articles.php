<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
  http_response_code(200);
  exit();
}

require_once __DIR__ . "/../config/db.php";

$raw = file_get_contents("php://input");
$body = json_decode($raw, true);

$authorId = isset($body["authorId"]) ? intval($body["authorId"]) : 0;
if ($authorId <= 0) {
  echo json_encode(["success" => false, "message" => "Invalid authorId"]);
  exit();
}

try {
  $sql = "
    SELECT 
      a.id_article, a.titre, a.resume, a.fichier_pdf, a.statut, a.date_soumission,
      c.id_conf, c.titre AS conf_titre
    FROM articles a
    LEFT JOIN conferences c ON c.id_conf = a.id_conf
    WHERE a.id_author = ?
    ORDER BY a.date_soumission DESC
  ";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([$authorId]);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode(["success" => true, "articles" => $rows]);
} catch (Exception $e) {
  echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
