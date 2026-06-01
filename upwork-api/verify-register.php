<?php
/**
 * TalentForge API - Verify OTP and complete registration
 * POST /api/verify-register.php
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
$otp = trim($input['otp'] ?? '');

if (!$email || !$otp) {
    http_response_code(400);
    sendJson(['success' => false, 'error' => 'Email and OTP are required']);
    exit;
}

$pending = getPendingByEmail($email);
if (!$pending) {
    http_response_code(400);
    sendJson(['success' => false, 'error' => 'Invalid or expired verification code']);
    exit;
}

if ($pending['otp'] !== $otp) {
    http_response_code(400);
    sendJson(['success' => false, 'error' => 'Invalid verification code']);
    exit;
}

$signupData = $pending['signupData'];
$name = $signupData['name'];
$password = $signupData['password'];
$role = $signupData['role'];
$mobile = $signupData['mobile'] ?? null;
$options = $signupData['options'] ?? [];

removePendingByEmail($email);

$user = [
    'id' => generateUuid(),
    'name' => $name,
    'email' => $email,
    'password' => $password,
    'role' => $role,
    'mobile' => $mobile,
    'gender' => $options['gender'] ?? null,
    'companyName' => $options['companyName'] ?? null,
    'primaryCategory' => $options['primaryCategory'] ?? null,
    'createdAt' => date('c'),
];

$users = readUsers();
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
