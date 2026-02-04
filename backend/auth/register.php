<?php
require_once __DIR__ . "/../config/db.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  echo json_encode(["success" => false, "message" => "Method not allowed"]);
  exit();
}

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!is_array($data)) {
  http_response_code(400);
  echo json_encode(["success" => false, "message" => "Invalid JSON"]);
  exit();
}

$firstName   = trim($data["firstName"] ?? "");
$lastName    = trim($data["lastName"] ?? "");
$email       = trim($data["email"] ?? "");
$password    = $data["password"] ?? "";
$affiliation = trim($data["affiliation"] ?? "");
$country     = trim($data["country"] ?? "");

if (!$firstName || !$lastName || !$email || !$password || !$affiliation || !$country) {
  http_response_code(400);
  echo json_encode(["success" => false, "message" => "Missing required fields"]);
  exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(["success" => false, "message" => "Invalid email"]);
  exit();
}

try {
  $stmt = $pdo->prepare("SELECT id_user FROM users WHERE email = ?");
  $stmt->execute([$email]);
  if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(["success" => false, "message" => "Email already exists"]);
    exit();
  }

  $hash = password_hash($password, PASSWORD_BCRYPT);
  $role = "author";

  $stmt = $pdo->prepare("
    INSERT INTO users (nom, prenom, email, password, role, affiliation, country)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  ");
  $stmt->execute([$lastName, $firstName, $email, $hash, $role, $affiliation, $country]);

  echo json_encode(["success" => true, "message" => "User created", "userId" => $pdo->lastInsertId()]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["success" => false, "message" => "Server error", "error" => $e->getMessage()]);
}

