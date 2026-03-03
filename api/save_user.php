<?php
require_once __DIR__ . '/config.php';

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

$id = isset($data['id']) ? (int)$data['id'] : 0;
$name = isset($data['name']) ? trim($data['name']) : '';
$score = isset($data['score']) ? (int)$data['score'] : 0;
$createdAt = isset($data['createdAt']) ? trim($data['createdAt']) : date('c');

if ($id < 1 || $id > 9999 || $name === '') {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Invalid id or name']);
    exit;
}

$stmt = $pdo->prepare(
    'INSERT INTO users (id, name, score, photo, created_at)
     VALUES (:id, :name, :score, NULL, :created_at)
     ON DUPLICATE KEY UPDATE name = VALUES(name), score = VALUES(score)'
);

$stmt->execute([
    ':id' => $id,
    ':name' => $name,
    ':score' => $score,
    ':created_at' => $createdAt,
]);

echo json_encode(['ok' => true, 'message' => 'User saved']);
