<?php
/**
 * TalentForge API - Register
 * POST /upwork-api/register.php
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
$name = trim($input['name'] ?? '');
$email = trim(strtolower($input['email'] ?? ''));
$password = $input['password'] ?? '';
$role = $input['role'] ?? '';
$mobile = isset($input['mobile']) ? trim($input['mobile']) : null;
$gender = $input['gender'] ?? null;
$companyName = isset($input['companyName']) ? trim($input['companyName']) : null;
$primaryCategory = $input['primaryCategory'] ?? null;

if (!$name || !$email || !$password || !$role) {
    http_response_code(400);
    sendJson(['success' => false, 'error' => 'Name, email, password, and role are required']);
    exit;
}

if (strlen($password) < 6) {
    http_response_code(400);
    sendJson(['success' => false, 'error' => 'Password must be at least 6 characters']);
    exit;
}

$role = ($role === 'client') ? 'client' : 'freelancer';

$users = readUsers();
foreach ($users as $u) {
    if (strtolower($u['email']) === $email) {
        http_response_code(400);
        sendJson(['success' => false, 'error' => 'An account with this email already exists']);
        exit;
    }
}

$user = [
    'id' => generateUuid(),
    'name' => $name,
    'email' => $email,
    'password' => $password,
    'role' => $role,
    'mobile' => $mobile,
    'gender' => $gender,
    'companyName' => $companyName,
    'primaryCategory' => $primaryCategory,
    'createdAt' => date('c'),
];

$users[] = $user;
writeUsers($users);

sendJson([
    'success' => true,
    'user' => [
        'id' => $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
        'mobile' => $user['mobile'] ?? null,
        'gender' => $user['gender'],
    ],
]);
