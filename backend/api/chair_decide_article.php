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

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  echo json_encode(["success" => false, "message" => "Method not allowed"]);
  exit();
}

$data = json_decode(file_get_contents("php://input"), true);

$userId = intval($data["userId"] ?? 0);       // chair id
$articleId = intval($data["articleId"] ?? 0);
$decision = trim($data["decision"] ?? "");    // accepte | rejete

if ($userId <= 0 || $articleId <= 0 || !in_array($decision, ["accepte", "rejete"])) {
  http_response_code(400);
  echo json_encode(["success" => false, "message" => "Invalid data"]);
  exit();
}

try {
  // تحقق من chair
  $st = $pdo->prepare("SELECT role FROM users WHERE id_user=?");
  $st->execute([$userId]);
  $u = $st->fetch(PDO::FETCH_ASSOC);

  if (!$u || $u["role"] !== "chair") {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Organizer only"]);
    exit();
  }

  // update article
  $stmt = $pdo->prepare("
    UPDATE articles
    SET statut = ?, final_decision_by = ?, final_decision_at = NOW()
    WHERE id_article = ?
  ");
  $stmt->execute([$decision, $userId, $articleId]);

  echo json_encode([
    "success" => true,
    "message" => $decision === "accepte" ? "Article accepted" : "Article rejected"
  ]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    "success" => false,
    "message" => "Server error",
    "error" => $e->getMessage()
  ]);
}