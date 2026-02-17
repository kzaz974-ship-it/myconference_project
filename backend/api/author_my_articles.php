<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/../config/db.php";

$input = json_decode(file_get_contents("php://input"), true);
$authorId = intval($input["authorId"] ?? 0);

if ($authorId <= 0) {
  echo json_encode(["success"=>false, "message"=>"Invalid authorId"]);
  exit;
}

try {
  $st = $pdo->prepare("
    SELECT 
      a.id_article, a.titre, a.statut, a.date_soumission,
      c.id_conf, c.titre AS conf_titre
    FROM articles a
    LEFT JOIN conferences c ON c.id_conf = a.id_conf
    WHERE a.id_author = ?
    ORDER BY a.date_soumission DESC
  ");
  $st->execute([$authorId]);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode(["success"=>true, "articles"=>$rows]);
} catch (Exception $e) {
  echo json_encode(["success"=>false, "message"=>"Server error"]);
}
