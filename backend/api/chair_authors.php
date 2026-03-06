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

$data = json_decode(file_get_contents("php://input"), true);
$chairId = intval($data["chairId"] ?? 0);

if ($chairId <= 0) {
  http_response_code(400);
  echo json_encode(["success" => false, "message" => "chairId required"]);
  exit();
}

try {
  $sql = "
    SELECT
      u.id_user AS id_author,
      CONCAT(u.prenom, ' ', u.nom) AS author,
      u.affiliation AS affiliation,
      u.country AS country,
      a.titre AS article,
      c.titre AS conference,
      a.statut AS decision
    FROM articles a
    INNER JOIN users u ON u.id_user = a.id_author
    INNER JOIN conferences c ON c.id_conf = a.id_conf
    WHERE c.created_by = ?
    ORDER BY a.id_article DESC
    LIMIT 300
  ";

  $stmt = $pdo->prepare($sql);
  $stmt->execute([$chairId]);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode(["success" => true, "rows" => $rows]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    "success" => false,
    "message" => "Server error",
    "error" => $e->getMessage()
  ]);
}