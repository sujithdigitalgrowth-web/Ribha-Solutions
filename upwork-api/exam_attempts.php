<?php
/**
 * TalentForge API - Exam attempts (scores) per freelancer
 * GET ?userId=xxx → list attempts for user (so we know if they passed)
 * POST body → save attempt (userId, skillId, skillName, score, passed, passedAt)
 */
require_once __DIR__ . '/functions.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(204);
    exit;
}

$userId = isset($_GET['userId']) ? trim($_GET['userId']) : null;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $attempts = readJsonFile(EXAM_ATTEMPTS_FILE);
    if ($userId !== null && $userId !== '') {
        $attempts = array_values(array_filter($attempts, function ($a) use ($userId) {
            return ($a['userId'] ?? '') === $userId;
        }));
    }
    sendJson($attempts);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = getJsonInput();
    $userIdIn = $input['userId'] ?? '';
    $skillId = $input['skillId'] ?? '';
    $skillName = $input['skillName'] ?? '';
    $score = isset($input['score']) ? (int) $input['score'] : 0;
    $passed = !empty($input['passed']);
    $passedAt = $input['passedAt'] ?? date('c');

    if ($userIdIn === '' || $skillId === '') {
        sendJson(['success' => false, 'error' => 'userId and skillId required']);
        exit;
    }
    $attempts = readJsonFile(EXAM_ATTEMPTS_FILE);
    $newAttempt = [
        'id' => generateUuid(),
        'userId' => $userIdIn,
        'skillId' => $skillId,
        'skillName' => $skillName,
        'score' => $score,
        'passed' => $passed,
        'passedAt' => $passedAt,
    ];
    array_unshift($attempts, $newAttempt);
    writeJsonFile(EXAM_ATTEMPTS_FILE, $attempts);
    sendJson(['success' => true, 'attempt' => $newAttempt]);
    exit;
}

http_response_code(405);
sendJson(['success' => false, 'error' => 'Method not allowed']);
