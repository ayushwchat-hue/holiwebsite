<?php
require_once __DIR__ . '/config.php';

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

$id = isset($data['id']) ? (int)$data['id'] : 0;
$photo = isset($data['photo']) ? $data['photo'] : null;

if ($id < 1 || $id > 9999 || !$photo) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Invalid id or photo']);
    exit;
}

$stmt = $pdo->prepare('UPDATE users SET photo = :photo WHERE id = :id');
$stmt->execute([
    ':photo' => $photo,
    ':id' => $id,
]);

if ($stmt->rowCount() === 0) {
    $insert = $pdo->prepare(
        'INSERT INTO users (id, name, score, photo, created_at)
         VALUES (:id, :name, 0, :photo, :created_at)
         ON DUPLICATE KEY UPDATE photo = VALUES(photo)'
    );

    $insert->execute([
        ':id' => $id,
        ':name' => 'Unknown',
        ':photo' => $photo,
        ':created_at' => date('c'),
    ]);
}

echo json_encode(['ok' => true, 'message' => 'Photo saved']);
