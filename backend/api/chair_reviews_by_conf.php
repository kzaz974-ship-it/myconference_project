<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { http_response_code(200); exit; }

require_once __DIR__ . "/../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);
$confId = (int)($data["confId"] ?? 0);
$userId = (int)($data["userId"] ?? 0); // chair id (optional but recommended)

if ($confId <= 0) {
  http_response_code(400);
  echo json_encode(["success" => false, "message" => "confId is required"]);
  exit;
}

try {
  // ✅ (اختياري) تأكد chair و conference ديالو
  if ($userId > 0) {
    $st = $pdo->prepare("SELECT role FROM users WHERE id_user=?");
    $st->execute([$userId]);
    $u = $st->fetch(PDO::FETCH_ASSOC);
    if (!$u || $u["role"] !== "chair") {
      http_response_code(403);
      echo json_encode(["success" => false, "message" => "Organizer only"]);
      exit;
    }

    $chkC = $pdo->prepare("SELECT id_conf FROM conferences WHERE id_conf=? AND created_by=?");
    $chkC->execute([$confId, $userId]);
    if (!$chkC->fetch()) {
      http_response_code(403);
      echo json_encode(["success" => false, "message" => "This conference is not yours"]);
      exit;
    }
  }

  // ✅ reviews ديال جميع المقالات ديال conference
  $q = $pdo->prepare("
    SELECT
      a.id_article, a.titre, a.statut,
      r.id_review,
      r.id_reviewer AS reviewer_id,
      ru.nom AS reviewer_nom, ru.prenom AS reviewer_prenom, ru.email AS reviewer_email,
      r.note, r.decision, r.commentaire, r.created_at
    FROM articles a
    JOIN reviews r ON r.id_article = a.id_article
    LEFT JOIN users ru ON ru.id_user = r.id_reviewer
    WHERE a.id_conf = ?
    ORDER BY a.id_article DESC, r.created_at DESC
  ");
  $q->execute([$confId]);
  $rows = $q->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode(["success" => true, "reviews" => $rows]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["success" => false, "message" => "Server error", "error" => $e->getMessage()]);
}
