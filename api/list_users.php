<?php
require_once __DIR__ . '/config.php';

$stmt = $pdo->query('SELECT id, name, score, created_at, updated_at, LEFT(photo, 80) AS photo_preview FROM users ORDER BY updated_at DESC');
$rows = $stmt->fetchAll();

echo json_encode([
    'ok' => true,
    'count' => count($rows),
    'users' => $rows
]);
