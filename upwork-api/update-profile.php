<?php
/**
 * TalentForge API - Update user profile
 * POST /api/update-profile.php
 * Requires email + password to verify identity. Updates name, mobile, etc.
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
$name = isset($input['name']) ? trim($input['name']) : null;
$mobile = isset($input['mobile']) ? trim($input['mobile']) : null;

if (!$email || !$password) {
    http_response_code(400);
    sendJson(['success' => false, 'error' => 'Email and password are required']);
    exit;
}

if ($name === null && $mobile === null) {
    http_response_code(400);
    sendJson(['success' => false, 'error' => 'Provide at least one field to update: name or mobile']);
    exit;
}

$users = readUsers();
$foundIndex = null;
foreach ($users as $i => $u) {
    if (strtolower($u['email']) === $email && $u['password'] === $password) {
        $foundIndex = $i;
        break;
    }
}

if ($foundIndex === null) {
    http_response_code(401);
    sendJson(['success' => false, 'error' => 'Invalid email or password']);
    exit;
}

if ($name !== null) {
    $users[$foundIndex]['name'] = $name;
}
if ($mobile !== null) {
    $users[$foundIndex]['mobile'] = $mobile ?: null;
}

writeUsers($users);

$user = $users[$foundIndex];
sendJson([
    'success' => true,
    'user' => [
        'id' => $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
        'mobile' => $user['mobile'] ?? null,
        'gender' => $user['gender'] ?? null,
    ],
]);
