<?php
/**
 * TalentForge API - List registered users (no passwords)
 * GET → array of { id, name, email, role, mobile?, gender? }
 */
require_once __DIR__ . '/functions.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    sendJson(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$users = readUsers();
$out = [];
foreach ($users as $u) {
    $out[] = [
        'id' => $u['id'] ?? '',
        'name' => $u['name'] ?? '',
        'email' => $u['email'] ?? '',
        'role' => $u['role'] ?? '',
        'mobile' => $u['mobile'] ?? null,
        'gender' => $u['gender'] ?? null,
    ];
}

sendJson($out);
