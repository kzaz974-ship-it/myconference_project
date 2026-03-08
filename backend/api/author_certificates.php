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
$userId = intval($data["userId"] ?? 0);

if ($userId <= 0) {
  http_response_code(400);
  echo json_encode(["success" => false, "message" => "userId required"]);
  exit();
}

try {
  $sql = "
    SELECT
      cert.id_cert,
      cert.cert_number,
      cert.type,
      cert.status,
      cert.issued_at,
      cert.pdf_path,
      cert.qr_token,
      cert.id_article,
      a.titre AS article_titre,
      c.titre AS conf_titre
    FROM certificates cert
    LEFT JOIN articles a ON a.id_article = cert.id_article
    LEFT JOIN conferences c ON c.id_conf = cert.id_conf
    WHERE cert.id_user = ?
    ORDER BY cert.id_cert DESC
  ";

  $stmt = $pdo->prepare($sql);
  $stmt->execute([$userId]);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode([
    "success" => true,
    "certificates" => $rows
  ]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    "success" => false,
    "message" => "Server error",
    "error" => $e->getMessage()
  ]);
}