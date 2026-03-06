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

$input = json_decode(file_get_contents("php://input"), true);

$reviewerId = intval($input["reviewerId"] ?? 0);
$articleId  = intval($input["articleId"] ?? 0);
$note       = isset($input["note"]) ? intval($input["note"]) : null;
$decision   = isset($input["decision"]) ? trim((string)$input["decision"]) : null;
$comment    = isset($input["commentaire"]) ? trim((string)$input["commentaire"]) : "";

if ($reviewerId <= 0 || $articleId <= 0) {
  http_response_code(400);
  echo json_encode(["success" => false, "message" => "reviewerId & articleId required"]);
  exit();
}

if ($note === null || $note < 0 || $note > 10) {
  http_response_code(400);
  echo json_encode(["success" => false, "message" => "note must be between 0 and 10"]);
  exit();
}

$allowed = ["accepte", "rejete", "mineur", "majeur"];
if ($decision === null || !in_array($decision, $allowed, true)) {
  http_response_code(400);
  echo json_encode(["success" => false, "message" => "decision invalid"]);
  exit();
}

try {
  // ✅ تأكد reviewer كاين و role ديالو reviewer
  $stRole = $pdo->prepare("SELECT role FROM users WHERE id_user=?");
  $stRole->execute([$reviewerId]);
  $u = $stRole->fetch(PDO::FETCH_ASSOC);
  if (!$u || $u["role"] !== "reviewer") {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Reviewer only"]);
    exit();
  }

  // ✅ تأكد بلي هاد reviewer عندو assignment على هاد المقال
  $chk = $pdo->prepare("
    SELECT id_assignment, status
    FROM assignments
    WHERE id_article=? AND id_reviewer=?
    LIMIT 1
  ");
  $chk->execute([$articleId, $reviewerId]);
  $as = $chk->fetch(PDO::FETCH_ASSOC);

  if (!$as) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Not assigned to this article"]);
    exit();
  }

  // ✅ Upsert review (UNIQUE(id_article,id_reviewer))
  $sql = "
    INSERT INTO reviews (note, commentaire, decision, id_article, id_reviewer, created_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON DUPLICATE KEY UPDATE
      note = VALUES(note),
      commentaire = VALUES(commentaire),
      decision = VALUES(decision),
      created_at = CURRENT_TIMESTAMP
  ";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([$note, $comment, $decision, $articleId, $reviewerId]);

  // ✅ update assignment status => reviewed
  $up = $pdo->prepare("UPDATE assignments SET status='reviewed' WHERE id_article=? AND id_reviewer=?");
  $up->execute([$articleId, $reviewerId]);

  // ✅ (اختياري) نخلي المقال ف en_review أو نغيروه
  // إذا بغيتي تغيّرو مباشرة (اختياري)
  // $upArt = $pdo->prepare("UPDATE articles SET statut='reviewed' WHERE id_article=? AND statut='en_review'");
  // $upArt->execute([$articleId]);

  echo json_encode(["success" => true, "message" => "Review submitted"]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["success" => false, "message" => "Server error", "error" => $e->getMessage()]);
}
