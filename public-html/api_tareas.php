<?php
// Basic JSON + CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Handle CORS preflight
if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function get_pdo(): PDO {
    $host = getenv('ENDPOINT') ?: 'mysql';
    $db   = getenv('DATABASE') ?: 'dabaseName';
    $user = getenv('USERD') ?: 'username';
    $pass = getenv('PASSD') ?: 'password$';

    $dsn = "mysql:host={$host};dbname={$db};charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    return new PDO($dsn, $user, $pass, $options);
}

function read_json_body(): array {
    $raw = file_get_contents('php://input') ?: '';
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

try {
    $pdo = get_pdo();

    switch ($method) {
        case 'GET':
            // GET /api_tareas.php or /api_tareas.php?id=1
            if (!empty($_GET['id'])) {
                $stmt = $pdo->prepare('SELECT id, titulo, descripcion, completado, creado_en, actualizado_en FROM tareas WHERE id = ?');
                $stmt->execute([ (int)$_GET['id'] ]);
                $row = $stmt->fetch();
                if ($row) {
                    echo json_encode($row);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Tarea no encontrada']);
                }
            } else {
                // Optional filter: ?completado=0|1
                if (isset($_GET['completado'])) {
                    $cmp = (int)$_GET['completado'] ? 1 : 0;
                    $stmt = $pdo->prepare('SELECT id, titulo, descripcion, completado, creado_en, actualizado_en FROM tareas WHERE completado = ? ORDER BY id DESC');
                    $stmt->execute([$cmp]);
                } else {
                    $stmt = $pdo->query('SELECT id, titulo, descripcion, completado, creado_en, actualizado_en FROM tareas ORDER BY id DESC');
                }
                echo json_encode($stmt->fetchAll());
            }
            break;

        case 'POST':
            // POST JSON: { titulo, descripcion?, completado? }
            $data = read_json_body();
            $titulo = trim($data['titulo'] ?? '');
            $descripcion = isset($data['descripcion']) ? trim((string)$data['descripcion']) : null;
            $completado = !empty($data['completado']) ? 1 : 0;

            if ($titulo === '') {
                http_response_code(400);
                echo json_encode(['error' => 'El campo titulo es obligatorio']);
                break;
            }

            $stmt = $pdo->prepare('INSERT INTO tareas (titulo, descripcion, completado) VALUES (?, ?, ?)');
            $stmt->execute([$titulo, $descripcion, $completado]);
            $id = (int)$pdo->lastInsertId();

            http_response_code(201);
            echo json_encode(['id' => $id, 'titulo' => $titulo, 'descripcion' => $descripcion, 'completado' => $completado]);
            break;

        case 'PUT':
            // PUT JSON: { id?, titulo?, descripcion?, completado? } and/or id in query
            $data = read_json_body();
            $id = isset($_GET['id']) ? (int)$_GET['id'] : (int)($data['id'] ?? 0);
            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Se requiere id para actualizar']);
                break;
            }

            $fields = [];
            $params = [];
            if (array_key_exists('titulo', $data)) { $fields[] = 'titulo = ?'; $params[] = trim((string)$data['titulo']); }
            if (array_key_exists('descripcion', $data)) { $fields[] = 'descripcion = ?'; $params[] = $data['descripcion'] !== null ? trim((string)$data['descripcion']) : null; }
            if (array_key_exists('completado', $data)) { $fields[] = 'completado = ?'; $params[] = !empty($data['completado']) ? 1 : 0; }

            if (!$fields) {
                http_response_code(400);
                echo json_encode(['error' => 'No hay campos para actualizar']);
                break;
            }

            $params[] = $id;
            $sql = 'UPDATE tareas SET ' . implode(', ', $fields) . ' WHERE id = ?';
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            echo json_encode(['ok' => true]);
            break;

        case 'DELETE':
            // DELETE /api_tareas.php?id=1
            $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Se requiere id para borrar']);
                break;
            }
            $stmt = $pdo->prepare('DELETE FROM tareas WHERE id = ?');
            $stmt->execute([$id]);
            echo json_encode(['ok' => true]);
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Metodo no permitido']);
            break;
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error del servidor', 'detail' => $e->getMessage()]);
}
