<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { http_response_code(200); exit; }

require_once __DIR__ . "/../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);
$reviewerId = (int)($data["reviewerId"] ?? 0);
$id_article = (int)($data["id_article"] ?? 0);

if ($reviewerId <= 0 || $id_article <= 0) {
  http_response_code(400);
  echo json_encode(["success" => false, "message" => "reviewerId and id_article are required"]);
  exit;
}

try {
  // ✅ تأكد user reviewer
  $st = $pdo->prepare("SELECT role FROM users WHERE id_user=?");
  $st->execute([$reviewerId]);
  $u = $st->fetch(PDO::FETCH_ASSOC);
  if (!$u || $u["role"] !== "reviewer") {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Reviewer only"]);
    exit;
  }

  // ✅ تأكد المقال متعيّن لهذا reviewer
  $chk = $pdo->prepare("SELECT id_assignment FROM assignments WHERE id_article=? AND id_reviewer=?");
  $chk->execute([$id_article, $reviewerId]);
  if (!$chk->fetch()) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "This article is not assigned to you"]);
    exit;
  }

  // ✅ جبد تفاصيل المقال + conf + author
  $q = $pdo->prepare("
    SELECT
      a.id_article, a.titre, a.resume, a.statut, a.date_soumission, a.fichier_pdf,
      c.id_conf AS conf_id, c.titre AS conf_titre,
      au.id_user AS author_id, au.nom AS author_nom, au.prenom AS author_prenom, au.email AS author_email
    FROM articles a
    JOIN conferences c ON c.id_conf = a.id_conf
    JOIN users au ON au.id_user = a.id_author
    WHERE a.id_article = ?
    LIMIT 1
  ");
  $q->execute([$id_article]);
  $details = $q->fetch(PDO::FETCH_ASSOC);

  if (!$details) {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "Article not found"]);
    exit;
  }

  echo json_encode(["success" => true, "details" => $details]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["success" => false, "message" => "Server error", "error" => $e->getMessage()]);
}
