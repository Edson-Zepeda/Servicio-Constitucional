<?php
$host = getenv('DB_HOST') ?: 'mysql';   // o 'db' según tu compose
$db   = getenv('DB_NAME') ?: 'miapp';
$user = getenv('DB_USER') ?: 'miapp_user';
$pass = getenv('DB_PASS') ?: 'miapp_pass';

$dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
$options = [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];
$pdo = new PDO($dsn, $user, $pass, $options);
