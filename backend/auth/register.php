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

$prenom = trim($data["prenom"] ?? "");
$nom = trim($data["nom"] ?? "");
$email = trim($data["email"] ?? "");
$affiliation = trim($data["affiliation"] ?? "");
$country = trim($data["country"] ?? "");
$password = $data["password"] ?? "";
$role = $data["role"] ?? "author";

if (!$prenom || !$nom || !$email || !$country || !$password) {
  http_response_code(400);
  echo json_encode(["success" => false, "message" => "Missing required fields"]);
  exit();
}

$allowed = ["author", "reviewer", "chair"];
if (!in_array($role, $allowed)) $role = "author";

$stmt = $pdo->prepare("SELECT id_user FROM users WHERE email=? LIMIT 1");
$stmt->execute([$email]);
if ($stmt->fetch()) {
  http_response_code(409);
  echo json_encode(["success" => false, "message" => "Email already exists"]);
  exit();
}

$hash = password_hash($password, PASSWORD_BCRYPT);

$stmt = $pdo->prepare("
  INSERT INTO users (nom, prenom, email, password, role, affiliation, country)
  VALUES (?, ?, ?, ?, ?, ?, ?)
");
$stmt->execute([$nom, $prenom, $email, $hash, $role, $affiliation, $country]);

echo json_encode(["success" => true, "message" => "User created"]);
