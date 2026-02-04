<?php
require_once __DIR__ . "/../config/db.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  echo json_encode(["success" => false, "message" => "Method not allowed"]);
  exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$email = trim($data["email"] ?? "");
$password = $data["password"] ?? "";

if (!$email || !$password) {
  http_response_code(400);
  echo json_encode(["success" => false, "message" => "Email and password required"]);
  exit();
}

try {
  $stmt = $pdo->prepare("SELECT id_user, nom, prenom, email, password, role, affiliation, country FROM users WHERE email=?");
  $stmt->execute([$email]);
  $user = $stmt->fetch();

  if (!$user || !password_verify($password, $user["password"])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Invalid credentials"]);
    exit();
  }

  unset($user["password"]);

  echo json_encode([
    "success" => true,
    "user" => $user
  ]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["success" => false, "message" => "Server error", "error" => $e->getMessage()]);
}
