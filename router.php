<?php

$root = realpath(__DIR__);
$dist = realpath(__DIR__ . DIRECTORY_SEPARATOR . 'dist');
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/';

$mimeTypes = [
    'html' => 'text/html; charset=utf-8',
    'js' => 'text/javascript; charset=utf-8',
    'css' => 'text/css; charset=utf-8',
    'json' => 'application/json; charset=utf-8',
    'svg' => 'image/svg+xml',
    'png' => 'image/png',
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'ico' => 'image/x-icon',
    'woff' => 'font/woff',
    'woff2' => 'font/woff2',
];

$sendFile = static function (string $filePath) use ($mimeTypes): void {
    $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
    $contentType = $mimeTypes[$extension] ?? 'application/octet-stream';
    header('Content-Type: ' . $contentType);
    header('Content-Length: ' . filesize($filePath));
    readfile($filePath);
};

$sanitizePath = static function (string $basePath, string $requestPath): ?string {
    $candidate = realpath($basePath . DIRECTORY_SEPARATOR . ltrim($requestPath, '/'));
    if (!$candidate) {
        return null;
    }

    return str_starts_with($candidate, $basePath) ? $candidate : null;
};

$rootFile = $sanitizePath($root, $path);
$distFile = $sanitizePath($dist, $path);

if ($path !== '/' && $rootFile && is_file($rootFile) && pathinfo($rootFile, PATHINFO_EXTENSION) === 'php') {
    require $rootFile;
    return true;
}

if ($path !== '/' && $distFile && is_file($distFile)) {
    $sendFile($distFile);
    return true;
}

if ($path !== '/' && $rootFile && is_file($rootFile)) {
    $sendFile($rootFile);
    return true;
}

$indexFile = $dist . DIRECTORY_SEPARATOR . 'index.html';
$sendFile($indexFile);
