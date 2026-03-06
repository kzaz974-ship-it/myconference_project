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
  // ✅ ملاحظة: deadline ما باناش فـ assignments اللي عطيتيني
  // إذا ماعندكش column deadline، نخليها NULL باش ما يطيحش query
  $sql = "
    SELECT
      asg.id_assignment,
      CONCAT(u.prenom, ' ', u.nom) AS reviewer,
      a.titre AS article,
      c.titre AS conference,
      asg.assigned_at AS assigned_at,
      NULL AS deadline,
      rv.created_at AS submitted_at,
      rv.note AS note,
      rv.commentaire AS commentaire,
      rv.decision AS decision,
      asg.status AS assignment_status
    FROM assignments asg
    INNER JOIN articles a ON a.id_article = asg.id_article
    INNER JOIN conferences c ON c.id_conf = a.id_conf
    INNER JOIN users u ON u.id_user = asg.id_reviewer
    LEFT JOIN reviews rv
      ON rv.id_article = asg.id_article AND rv.id_reviewer = asg.id_reviewer
    WHERE c.created_by = ?
    ORDER BY asg.id_assignment DESC
    LIMIT 300
  ";

  $stmt = $pdo->prepare($sql);
  $stmt->execute([$chairId]);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

  $out = [];
  foreach ($rows as $x) {
    // status نخرجوها من assignment_status + واش كاين note/commentaire
    $hasReview = ($x["note"] !== null) || (!empty($x["commentaire"])) || (!empty($x["decision"]));
    $status = $hasReview ? "reviewed" : "pending";

    // إذا assignment_status = reviewed خليها reviewed حتى إلا شي field ناقص
    if (($x["assignment_status"] ?? "") === "reviewed") {
      $status = "reviewed";
    }

    $out[] = [
      "reviewer" => $x["reviewer"],
      "article" => $x["article"],
      "conference" => $x["conference"],
      "assigned_at" => $x["assigned_at"],
      "deadline" => $x["deadline"],
      "submitted_at" => $x["submitted_at"],
      "note" => $x["note"] !== null ? intval($x["note"]) : null,
      "commentaire" => $x["commentaire"],
      "status" => $status
    ];
  }

  echo json_encode(["success" => true, "rows" => $out]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    "success" => false,
    "message" => "Server error",
    "error" => $e->getMessage()
  ]);
}