<?php
/**
 * TalentForge API - Send OTP for email verification
 * POST /api/send-otp.php
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
$signupData = $input['signupData'] ?? null;

if (!$email || !$signupData) {
    http_response_code(400);
    sendJson(['success' => false, 'error' => 'Email and signupData are required']);
    exit;
}

$name = trim($signupData['name'] ?? '');
$password = $signupData['password'] ?? '';
$role = $signupData['role'] ?? '';
$mobile = trim($signupData['mobile'] ?? '');
$options = $signupData['options'] ?? [];

if (!$name || !$password || !$role) {
    http_response_code(400);
    sendJson(['success' => false, 'error' => 'Invalid signup data']);
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

$otp = generateOTP();
$pending = [
    'email' => $email,
    'otp' => $otp,
    'signupData' => [
        'name' => $name,
        'password' => $password,
        'role' => $role,
        'mobile' => $mobile ?: null,
        'options' => $options,
    ],
    'createdAt' => date('c'),
];

$all = readPendingVerifications();
$all = array_filter($all, function ($p) use ($email) {
    return strtolower($p['email'] ?? '') !== $email;
});
$all[] = $pending;
writePendingVerifications($all);

require_once __DIR__ . '/mail.php';
$result = sendOtpEmail($email, $otp);

if (!$result['success']) {
    http_response_code(500);
    sendJson(['success' => false, 'error' => $result['error'] ?? 'Failed to send email']);
    exit;
}

sendJson(['success' => true, 'message' => 'Verification code sent to your email']);
