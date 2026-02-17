<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
  http_response_code(200);
  exit;
}

require_once __DIR__ . "/../../config/db.php"; // <-- تأكد المسار صحيح

try {
  // FormData كتوصل هنا
  $userId  = isset($_POST["userId"]) ? intval($_POST["userId"]) : 0;
  $confId  = isset($_POST["confId"]) ? intval($_POST["confId"]) : 0;
  $title   = isset($_POST["title"]) ? trim($_POST["title"]) : "";
  $resume  = isset($_POST["abstract"]) ? trim($_POST["abstract"]) : ""; // abstract جاية من create.tsx

  if ($userId <= 0 || $confId <= 0 || $title === "" || $resume === "") {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing fields"]);
    exit;
  }

  // (اختياري) تأكد user راه author
  $chkU = $pdo->prepare("SELECT role FROM users WHERE id_user=?");
  $chkU->execute([$userId]);
  $u = $chkU->fetch(PDO::FETCH_ASSOC);
  if (!$u) {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "User not found"]);
    exit;
  }
  // تقدر تحيد هاد الشرط إذا ما بغيتيش تمنع chair/reviewer
  if ($u["role"] !== "author") {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Author only"]);
    exit;
  }

  // (اختياري) تأكد conference كاينة
  $chkC = $pdo->prepare("SELECT id_conf FROM conferences WHERE id_conf=?");
  $chkC->execute([$confId]);
  if (!$chkC->fetch()) {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "Conference not found"]);
    exit;
  }

  // PDF upload (اختياري)
  $pdfNameToStore = null;

  if (isset($_FILES["pdf"]) && $_FILES["pdf"]["error"] === UPLOAD_ERR_OK) {
    $tmp  = $_FILES["pdf"]["tmp_name"];
    $orig = $_FILES["pdf"]["name"];

    $ext = strtolower(pathinfo($orig, PATHINFO_EXTENSION));
    if ($ext !== "pdf") {
      http_response_code(400);
      echo json_encode(["success" => false, "message" => "File must be PDF"]);
      exit;
    }

    // folder uploads/articles
    $uploadDir = __DIR__ . "/../../uploads/articles";
    if (!is_dir($uploadDir)) {
      mkdir($uploadDir, 0777, true);
    }

    $safeBase = preg_replace("/[^a-zA-Z0-9_\.-]/", "_", pathinfo($orig, PATHINFO_FILENAME));
    $newName  = $safeBase . "_" . $confId . "_" . time() . "_" . rand(1000, 9999) . ".pdf";
    $dest     = $uploadDir . "/" . $newName;

    if (!move_uploaded_file($tmp, $dest)) {
      http_response_code(500);
      echo json_encode(["success" => false, "message" => "Failed to upload PDF"]);
      exit;
    }

    $pdfNameToStore = $newName;
  }

  // insert article
  $sql = "INSERT INTO articles (titre, resume, fichier_pdf, statut, date_soumission, id_conf, id_author)
          VALUES (?, ?, ?, 'soumis', NOW(), ?, ?)";

  $stmt = $pdo->prepare($sql);
  $stmt->execute([$title, $resume, $pdfNameToStore, $confId, $userId]);

  echo json_encode([
    "success" => true,
    "id_article" => intval($pdo->lastInsertId()),
    "message" => "Article created"
  ]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    "success" => false,
    "message" => "Server error",
    "error" => $e->getMessage()
  ]);
}
