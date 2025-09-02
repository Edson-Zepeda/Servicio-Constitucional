<?php
header('Content-Type: application/json');
require __DIR__ . '/bd.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
  $stmt = $pdo->query('SELECT * FROM tasks ORDER BY id DESC');
  echo json_encode($stmt->fetchAll());
  exit;
}

if ($method === 'POST') {
  $data = json_decode(file_get_contents('php://input'), true);
  if (!isset($data['title']) || trim($data['title']) === '') {
    http_response_code(400);
    echo json_encode(['error'=>'title requerido']);
    exit;
  }
  $stmt = $pdo->prepare('INSERT INTO tasks (title) VALUES (:t)');
  $stmt->execute([':t'=>$data['title']]);
  echo json_encode(['id'=>(int)$pdo->lastInsertId(),'title'=>$data['title'],'done'=>0]);
  exit;
}

if ($method === 'PATCH') {
  $data = json_decode(file_get_contents('php://input'), true);
  if (!isset($data['id'],$data['done'])) {
    http_response_code(400);
    echo json_encode(['error'=>'id y done requeridos']);
    exit;
  }
  $stmt = $pdo->prepare('UPDATE tasks SET done=:d WHERE id=:i');
  $stmt->execute([':d'=>(int)$data['done'], ':i'=>(int)$data['id']]);
  echo json_encode(['ok'=>true]);
  exit;
}

if ($method === 'DELETE') {
  parse_str($_SERVER['QUERY_STRING'] ?? '', $q);
  if (!isset($q['id'])) { http_response_code(400); echo json_encode(['error'=>'id requerido']); exit; }
  $stmt = $pdo->prepare('DELETE FROM tasks WHERE id=:i');
  $stmt->execute([':i'=>(int)$q['id']]);
  echo json_encode(['ok'=>true]);
  exit;
}

http_response_code(405);
echo json_encode(['error'=>'Método no permitido']);
    