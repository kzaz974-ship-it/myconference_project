<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
  http_response_code(200);
  exit();
}

require_once __DIR__ . "/../config/db.php"; // تأكد path ديال db.php عندك صحيح

$raw = file_get_contents("php://input");
$body = json_decode($raw, true);

$articleId = isset($body["articleId"]) ? intval($body["articleId"]) : 0;
$decision  = isset($body["decision"]) ? trim($body["decision"]) : "";

if ($articleId <= 0 || !in_array($decision, ["accepte", "rejete"])) {
  echo json_encode(["success" => false, "message" => "Invalid articleId or decision"]);
  exit();
}

try {
  // 1) update article status
  $stmt = $pdo->prepare("UPDATE articles SET statut = ? WHERE id_article = ?");
  $stmt->execute([$decision, $articleId]);

  // 2) (اختياري) update assignments to reviewed
  $stmt2 = $pdo->prepare("UPDATE assignments SET status = 'reviewed' WHERE id_article = ?");
  $stmt2->execute([$articleId]);

  // 3) return updated article
  $stmt3 = $pdo->prepare("SELECT id_article, titre, statut, id_author, id_conf FROM articles WHERE id_article = ?");
  $stmt3->execute([$articleId]);
  $article = $stmt3->fetch(PDO::FETCH_ASSOC);

  echo json_encode([
    "success" => true,
    "message" => "Article updated",
    "article" => $article
  ]);
} catch (Exception $e) {
  echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
