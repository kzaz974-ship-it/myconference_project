<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/../config/db.php";

$raw = file_get_contents("php://input");
$body = json_decode($raw, true);

$reviewerId = isset($body["reviewerId"]) ? (int)$body["reviewerId"] : 0;
$articleId  = isset($body["articleId"])  ? (int)$body["articleId"]  : 0;

if ($reviewerId <= 0 || $articleId <= 0) {
  echo json_encode(["success" => false, "message" => "reviewerId + articleId required"]);
  exit;
}

$BASE_URL = "http://localhost:8080";

$sql = "
SELECT 
  a.id_article, a.titre, a.pdf_path,
  c.titre AS conf_titre,
  CONCAT(u.prenom,' ',u.nom) AS author_name,
  u.email AS author_email,
  ass.assigned_at
FROM assignments ass
JOIN articles a ON a.id_article = ass.id_article
JOIN conferences c ON c.id_conf = a.id_conf
JOIN users u ON u.id_user = a.id_author
WHERE ass.id_reviewer = ? AND ass.id_article = ?
LIMIT 1
";

$stmt = $pdo->prepare($sql);
$stmt->execute([$reviewerId, $articleId]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$row) {
  echo json_encode(["success" => false, "message" => "Not assigned or not found"]);
  exit;
}

$row["pdf_url"] = !empty($row["pdf_path"]) ? (rtrim($BASE_URL,"/") . "/" . ltrim($row["pdf_path"],"/")) : null;

echo json_encode(["success" => true, "info" => $row]);
