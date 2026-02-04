<?php
require_once __DIR__ . "/../config/db.php";

$id = intval($_GET["id"] ?? 0);
$st = $pdo->prepare("SELECT * FROM conferences WHERE id=?");
$st->execute([$id]);
$row = $st->fetch();

if (!$row) { http_response_code(404); echo json_encode(["error"=>"Not found"]); exit; }
echo json_encode($row);
