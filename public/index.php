<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Twig\Environment;
use Twig\Loader\FilesystemLoader;
use Twig\TwigFunction;

// ── Static files (PHP built-in server passthrough) ────────────────────────────
if (PHP_SAPI === 'cli-server') {
    $file = __DIR__ . parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
    if ($file !== __FILE__ && is_file($file)) {
        return false;
    }
}

// ── Twig ──────────────────────────────────────────────────────────────────────
$loader = new FilesystemLoader(__DIR__ . '/../resources/views');
$twig   = new Environment($loader, ['cache' => false]);

$manifestFile = __DIR__ . '/dist/.vite/manifest.json';
$manifest     = is_file($manifestFile) ? json_decode((string) file_get_contents($manifestFile), true) : null;
$isDev        = ($manifest === null);
$viteOrigin   = 'http://localhost:' . (getenv('VITE_PORT') ?: '5173');

$twig->addFunction(new TwigFunction('vite_asset', function (string $entry) use ($isDev, $viteOrigin, $manifest): string {
    if ($isDev) {
        return $viteOrigin . '/' . ltrim($entry, '/');
    }
    return '/dist/' . ($manifest[$entry]['file'] ?? ltrim($entry, '/'));
}));

$twig->addFunction(new TwigFunction('csrf_token', fn (): string => bin2hex(random_bytes(16))));

// ── Globals ───────────────────────────────────────────────────────────────────
$reqPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$method  = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

$twig->addGlobal('vite_dev',    $isDev);
$twig->addGlobal('vite_origin', $viteOrigin);
$twig->addGlobal('app', [
    'locale'  => 'fr',
    'request' => ['pathinfo' => $reqPath],
]);
$twig->addGlobal('user', [
    'name'     => 'Administrateur',
    'initials' => 'AD',
    'theme'    => $_COOKIE['theme'] ?? 'light',
]);

// ── SQLite database ───────────────────────────────────────────────────────────
function db(): PDO
{
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $dir = __DIR__ . '/../storage';
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }

    $pdo = new PDO('sqlite:' . $dir . '/openemr.sqlite', null, null, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS patients (
            pid         INTEGER PRIMARY KEY AUTOINCREMENT,
            fname       TEXT    NOT NULL,
            lname       TEXT    NOT NULL,
            dob         TEXT    NOT NULL,
            sex         TEXT    NOT NULL DEFAULT 'M',
            phone_cell  TEXT,
            phone_home  TEXT,
            provider_id INTEGER,
            last_visit  TEXT,
            created_at  TEXT DEFAULT (datetime('now'))
        )
    ");

    return $pdo;
}

// ── Router ────────────────────────────────────────────────────────────────────

// POST /patients — create, respond with Turbo Stream
if ($reqPath === '/patients' && $method === 'POST') {
    $f = $_POST;

    db()->prepare('INSERT INTO patients (fname, lname, dob, sex, phone_cell) VALUES (?, ?, ?, ?, ?)')
       ->execute([
           trim((string)($f['fname'] ?? '')),
           trim((string)($f['lname'] ?? '')),
           (string)($f['dob']  ?? ''),
           (string)($f['sex']  ?? 'M'),
           trim((string)($f['phone_cell'] ?? '')) ?: null,
       ]);

    $patient = [
        'pid'        => db()->lastInsertId(),
        'fname'      => trim((string)($f['fname'] ?? '')),
        'lname'      => trim((string)($f['lname'] ?? '')),
        'dob'        => (string)($f['dob'] ?? ''),
        'sex'        => (string)($f['sex'] ?? 'M'),
        'phone_cell' => trim((string)($f['phone_cell'] ?? '')) ?: null,
    ];

    header('Content-Type: text/vnd.turbo-stream.html; charset=utf-8');
    echo $twig->render('patients/_stream_create.html.twig', ['patient' => $patient]);
    exit;
}

// GET /patients — list
if ($reqPath === '/patients' && $method === 'GET') {
    $patients = db()->query('SELECT * FROM patients ORDER BY lname, fname')->fetchAll();

    header('Content-Type: text/html; charset=utf-8');
    echo $twig->render('patients/index.html.twig', [
        'title'              => 'Patients — OpenEMR',
        'flashes'            => [],
        'notification_count' => 0,
        'patients'           => $patients,
        'pagination'         => ['total_pages' => 0],
    ]);
    exit;
}

// Default — dashboard
header('Content-Type: text/html; charset=utf-8');
echo $twig->render('dashboard/index.html.twig', [
    'title'              => 'OpenEMR',
    'flashes'            => [],
    'notification_count' => 0,
]);
