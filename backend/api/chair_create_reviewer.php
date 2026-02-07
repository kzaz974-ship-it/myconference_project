<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") exit();

require_once __DIR__ . "/../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$userId = (int)($data["userId"] ?? 0); // chair id (optional for now)
$nom = trim($data["nom"] ?? "");
$prenom = trim($data["prenom"] ?? "");
$email = trim($data["email"] ?? "");
$password = $data["password"] ?? "";
$affiliation = trim($data["affiliation"] ?? "");
$country = trim($data["country"] ?? "");

if ($nom==="" || $prenom==="" || $email==="" || $password==="" || $country==="") {
  http_response_code(400);
  echo json_encode(["success"=>false,"message"=>"Missing required fields"]);
  exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(["success"=>false,"message"=>"Invalid email"]);
  exit();
}

try {
  // (اختياري) تأكدي بلي اللي كينشئ هو chair
  if ($userId > 0) {
    $chk = $pdo->prepare("SELECT role FROM users WHERE id_user=?");
    $chk->execute([$userId]);
    $row = $chk->fetch(PDO::FETCH_ASSOC);
    if (!$row || $row["role"] !== "chair") {
      http_response_code(403);
      echo json_encode(["success"=>false,"message"=>"Organizer only"]);
      exit();
    }
  }

  // check email exists
  $check = $pdo->prepare("SELECT id_user FROM users WHERE email=?");
  $check->execute([$email]);
  if ($check->fetch()) {
    http_response_code(409);
    echo json_encode(["success"=>false,"message"=>"Email already exists"]);
    exit();
  }

  $hash = password_hash($password, PASSWORD_BCRYPT);

  $stmt = $pdo->prepare("
    INSERT INTO users (nom, prenom, email, password, role, affiliation, country)
    VALUES (?, ?, ?, ?, 'reviewer', ?, ?)
  ");
  $stmt->execute([$nom, $prenom, $email, $hash, $affiliation, $country]);

  echo json_encode(["success"=>true,"message"=>"Reviewer created"]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["success"=>false,"message"=>"Server error"]);
}
