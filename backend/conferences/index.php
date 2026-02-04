<?php
require_once __DIR__ . "/../config/db.php";

$st = $pdo->query("SELECT id,title,description,start_date,end_date,location FROM conferences ORDER BY start_date DESC");
echo json_encode($st->fetchAll());
