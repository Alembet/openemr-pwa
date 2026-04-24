<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Twig\Environment;
use Twig\Loader\FilesystemLoader;
use Twig\TwigFunction;

// ── Static files (PHP built-in server only) ───────────────────────────────────
if (PHP_SAPI === 'cli-server') {
    $file = __DIR__ . parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
    if ($file !== __FILE__ && is_file($file)) {
        return false;
    }
}

// ── Twig setup ────────────────────────────────────────────────────────────────
$loader = new FilesystemLoader(__DIR__ . '/../resources/views');
$twig   = new Environment($loader, ['cache' => false]);

// Auto-detect dev vs prod via the Vite manifest presence
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

$twig->addGlobal('vite_dev',  $isDev);
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

// ── Router ────────────────────────────────────────────────────────────────────
$template = match(true) {
    str_starts_with($reqPath, '/patients') => 'patients/index.html.twig',
    default                                => 'dashboard/index.html.twig',
};

// ── Render ────────────────────────────────────────────────────────────────────
header('Content-Type: text/html; charset=utf-8');
echo $twig->render($template, [
    'title'              => 'OpenEMR',
    'flashes'            => [],
    'notification_count' => 0,
    'patients'           => [],
    'pagination'         => ['total_pages' => 0],
]);
