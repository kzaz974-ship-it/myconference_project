<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once __DIR__ . "/../config/db.php"; // بدّل المسار حسب db.php ديالك

$input = json_decode(file_get_contents("php://input"), true);
$reviewerId = isset($input["reviewerId"]) ? intval($input["reviewerId"]) : 0;

if ($reviewerId <= 0) {
  echo json_encode(["success" => false, "message" => "Missing reviewerId"]);
  exit;
}

try {
  // base url باش نصاوب pdf_url صحيح
  // إذا API_URL = http://localhost:8080/myconference_project/backend
  $BASE = "http://localhost:8080/myconference_project/backend";

  $sql = "
    SELECT
      a.id_assignment,
      a.status AS assignment_status,
      a.assigned_at,

      ar.id_article,
      ar.titre,
      ar.statut,
      ar.date_soumission,
      ar.fichier_pdf,

      c.id_conf,
      c.titre AS conf_titre,

      u.id_user AS author_id,
      u.prenom AS author_prenom,
      u.nom AS author_nom,
      u.email AS author_email

    FROM assignments a
    INNER JOIN articles ar ON ar.id_article = a.id_article
    INNER JOIN conferences c ON c.id_conf = ar.id_conf
    INNER JOIN users u ON u.id_user = ar.id_author
    WHERE a.id_reviewer = ?
    ORDER BY a.assigned_at DESC
  ";

  $stmt = $pdo->prepare($sql);
  $stmt->execute([$reviewerId]);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // زيد pdf_url
  foreach ($rows as &$r) {
    if (!empty($r["fichier_pdf"])) {
      $r["pdf_url"] = $BASE . "/uploads/articles/" . $r["fichier_pdf"];
    } else {
      $r["pdf_url"] = null;
    }
  }

  echo json_encode(["success" => true, "assignments" => $rows]);
} catch (Exception $e) {
  echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
