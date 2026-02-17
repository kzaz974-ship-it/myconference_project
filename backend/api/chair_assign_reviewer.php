<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once __DIR__ . "/../config/db.php";

$input = json_decode(file_get_contents("php://input"), true);

$userId     = intval($input["userId"] ?? 0);
$id_article = intval($input["id_article"] ?? 0);
$id_reviewer= intval($input["id_reviewer"] ?? 0);

if ($userId<=0 || $id_article<=0 || $id_reviewer<=0) {
  echo json_encode(["success"=>false,"message"=>"Missing fields"]);
  exit;
}

try {
  // تحقق chair
  $st = $pdo->prepare("SELECT role FROM users WHERE id_user=?");
  $st->execute([$userId]);
  $u = $st->fetch(PDO::FETCH_ASSOC);
  if (!$u || $u["role"] !== "chair") {
    echo json_encode(["success"=>false,"message"=>"Access denied"]);
    exit;
  }

  // Insert assignment (status ALWAYS assigned)
  $ins = $pdo->prepare("
    INSERT INTO assignments (id_article, id_reviewer, status)
    VALUES (?, ?, 'assigned')
    ON DUPLICATE KEY UPDATE status='assigned', assigned_at=NOW()
  ");
  $ins->execute([$id_article, $id_reviewer]);

  // Update article status
  $up = $pdo->prepare("UPDATE articles SET statut='en_review' WHERE id_article=?");
  $up->execute([$id_article]);

  echo json_encode(["success"=>true,"message"=>"Reviewer assigned"]);
} catch (Exception $e) {
  echo json_encode(["success"=>false,"message"=>$e->getMessage()]);
}
