<?php
// index.php (uddrag til /pips endpoint)
require '../.env';

// CORS headers (må gerne stå altid)
header("Access-Control-Allow-Origin: http://127.0.0.1:5500"); // eller "*" hvis du vil
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Svar på preflight (OPTIONS) med 204 No Content
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

$dsn = "mysql:host=localhost;dbname=mul2025;charset=utf8mb4";
$user = "root";
$pass = getenv(name: 'PASSWORD');

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => "DB connection failed"]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url(url: $_SERVER['REQUEST_URI'], component: PHP_URL_PATH);

// GET /pips  -> hent pips med paginering
if ($method === 'GET' && preg_match('#/pips$#', $path)) {
    $limit = isset($_GET['limit']) ? max(1, min(20, (int) $_GET['limit'])) : 3;

    // Robust pagination på tid + id (tie-break)
    $beforeTime = isset($_GET['before_time']) ? $_GET['before_time'] : null; // 'YYYY-mm-dd HH:ii:ss'
    $beforeId = isset($_GET['before_id']) ? (int) $_GET['before_id'] : null;

    if ($beforeTime !== null && $beforeId !== null) {
        $sql = "SELECT idpips, pipname, pipcontent, piptime
            FROM pips
            WHERE (piptime < :bt) OR (piptime = :bt AND idpips < :bid)
            ORDER BY piptime DESC, idpips DESC
            LIMIT :lim";
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':bt', $beforeTime);
        $stmt->bindValue(':bid', $beforeId, PDO::PARAM_INT);
    } else {
        // Første load: nyeste først på tid
        $sql = "SELECT idpips, pipname, pipcontent, piptime
            FROM pips
            ORDER BY piptime DESC, idpips DESC
            LIMIT :lim";
        $stmt = $pdo->prepare($sql);
    }

    $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $rowsDesc = $stmt->fetchAll();

    // Vend til ASC (ældst -> nyest) i svaret
    $items = array_reverse($rowsDesc);

    // has_more? (find ældre end det ældste i dette sæt)
    $hasMore = false;
    if (!empty($items)) {
        $oldestTime = $items[0]['piptime'];
        $oldestId = $items[0]['idpips'];
        $stmt2 = $pdo->prepare(
            "SELECT 1 FROM pips
       WHERE (piptime < :ot) OR (piptime = :ot AND idpips < :oid)
       LIMIT 1"
        );
        $stmt2->bindValue(':ot', $oldestTime);
        $stmt2->bindValue(':oid', $oldestId, PDO::PARAM_INT);
        $stmt2->execute();
        $hasMore = (bool) $stmt2->fetchColumn();
    }

    echo json_encode([
        'items' => $items,
        'has_more' => $hasMore
    ]);
    exit;
}

// POST /pips  -> (valgfrit) opret nyt pip
if ($method === 'POST' && preg_match('#/pips$#', $path)) {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $name = trim($input['pipname'] ?? '');
    $text = trim($input['pipcontent'] ?? '');

    if ($name === '' || $text === '') {
        http_response_code(400);
        echo json_encode(["error" => "pipname og pipcontent er påkrævet"]);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO pips (pipname, pipcontent, piptime)
                         VALUES (:n, :c, NOW())");
    $stmt->execute([':n' => $name, ':c' => $text]);

    echo json_encode(["ok" => true, "idpips" => (int) $pdo->lastInsertId()]);
    exit;
}

// Fald tilbage: 404
http_response_code(404);
echo json_encode(["error" => "Not found"]);
