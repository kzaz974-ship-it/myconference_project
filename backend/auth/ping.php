<?php
header("Content-Type: application/json");
echo json_encode(["ok" => true, "time" => date("Y-m-d H:i:s")]);
