<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

require_once __DIR__ . "/../config/db.php";

$input = json_decode(file_get_contents("php://input"), true);

$reviewerId = intval($input["reviewerId"] ?? 0);
$articleId  = intval($input["articleId"] ?? 0);
$note       = isset($input["note"]) ? intval($input["note"]) : null;
$decision   = $input["decision"] ?? null;
$comment    = $input["commentaire"] ?? null;

if ($reviewerId <= 0 || $articleId <= 0) {
  echo json_encode(["success" => false, "message" => "reviewerId & articleId required"]);
  exit;
}

if ($note === null || $note < 0 || $note > 10) {
  echo json_encode(["success" => false, "message" => "note must be between 0 and 10"]);
  exit;
}

$allowed = ["accepte","rejete","mineur","majeur"];
if ($decision === null || !in_array($decision, $allowed, true)) {
  echo json_encode(["success" => false, "message" => "decision invalid"]);
  exit;
}

// تأكد هاد reviewer عندو assignment على هاد المقال
$chk = $conn->prepare("SELECT id_assignment FROM assignments WHERE id_article=? AND id_reviewer=?");
$chk->bind_param("ii", $articleId, $reviewerId);
$chk->execute();
$chkRes = $chk->get_result();
if ($chkRes->num_rows === 0) {
  echo json_encode(["success" => false, "message" => "Not assigned to this article"]);
  exit;
}

// Upsert review (لأن عندك UNIQUE(id_article,id_reviewer))
$sql = "
INSERT INTO reviews (note, commentaire, decision, id_article, id_reviewer)
VALUES (?, ?, ?, ?, ?)
ON DUPLICATE KEY UPDATE
  note = VALUES(note),
  commentaire = VALUES(commentaire),
  decision = VALUES(decision),
  created_at = CURRENT_TIMESTAMP
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("issii", $note, $comment, $decision, $articleId, $reviewerId);

if (!$stmt->execute()) {
  echo json_encode(["success" => false, "message" => "DB error: " . $conn->error]);
  exit;
}

// update assignment status => reviewed
$up = $conn->prepare("UPDATE assignments SET status='reviewed' WHERE id_article=? AND id_reviewer=?");
$up->bind_param("ii", $articleId, $reviewerId);
$up->execute();

echo json_encode(["success" => true, "message" => "Review submitted"]);
