<?php
require_once __DIR__ . "/../config/db.php";

$id = intval($_GET["id_cert"] ?? 0);
if ($id <= 0) {
  die("Invalid certificate id");
}

$stmt = $pdo->prepare("
  SELECT
    cert.*,
    u.nom,
    u.prenom,
    a.titre AS article_titre,
    c.titre AS conf_titre,
    c.date_debut,
    c.date_fin
  FROM certificates cert
  JOIN users u ON u.id_user = cert.id_user
  LEFT JOIN articles a ON a.id_article = cert.id_article
  LEFT JOIN conferences c ON c.id_conf = cert.id_conf
  WHERE cert.id_cert = ?
");
$stmt->execute([$id]);
$cert = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$cert) {
  die("Certificate not found");
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Certificate</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f5f7fa;
      padding: 30px;
    }
    .cert {
      max-width: 900px;
      margin: auto;
      background: #fff;
      border: 8px solid #1e88e5;
      padding: 50px;
      text-align: center;
    }
    h1 { color: #1e88e5; margin-bottom: 10px; }
    h2 { margin: 20px 0; }
    .small { color: #666; }
  </style>
</head>
<body>
  <div class="cert">
    <h1>Certificate of Acceptance</h1>
    <p class="small">Certificate No: <?= htmlspecialchars($cert["cert_number"]) ?></p>

    <h2>This is to certify that</h2>
    <h2><?= htmlspecialchars($cert["prenom"] . " " . $cert["nom"]) ?></h2>

    <p>has an accepted article in the conference:</p>
    <h3><?= htmlspecialchars($cert["conf_titre"] ?? "-") ?></h3>

    <p>Article title:</p>
    <h3><?= htmlspecialchars($cert["article_titre"] ?? "-") ?></h3>

    <p class="small">
      Issued at: <?= htmlspecialchars($cert["issued_at"] ?? "-") ?>
    </p>
  </div>
</body>
</html>