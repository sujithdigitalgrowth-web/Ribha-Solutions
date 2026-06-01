<?php
/**
 * TalentForge API - Login
 * POST /upwork-api/login.php
 */
require_once __DIR__ . '/functions.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    sendJson(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = getJsonInput();
$email = trim(strtolower($input['email'] ?? ''));
$password = $input['password'] ?? '';

if (!$email || !$password) {
    http_response_code(400);
    sendJson(['success' => false, 'error' => 'Email and password are required']);
    exit;
}

$users = readUsers();
$found = null;
foreach ($users as $u) {
    if (strtolower($u['email']) === $email && $u['password'] === $password) {
        $found = $u;
        break;
    }
}

if (!$found) {
    http_response_code(401);
    sendJson(['success' => false, 'error' => 'Invalid email or password']);
    exit;
}

sendJson([
    'success' => true,
    'user' => [
        'id' => $found['id'],
        'name' => $found['name'],
        'email' => $found['email'],
        'role' => $found['role'],
        'mobile' => $found['mobile'] ?? null,
        'gender' => $found['gender'] ?? null,
    ],
]);
