<?php
/**
 * TalentForge API - Exam definitions (dynamic skill tests)
 * GET → list all exams (skillId, skillName, icon, passingScore, timeLimitMinutes, questions)
 * Data stored in data/exam_definitions.json
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

ensureDataDir();
if (!file_exists(EXAM_DEFINITIONS_FILE)) {
    sendJson([]);
    exit;
}
$json = file_get_contents(EXAM_DEFINITIONS_FILE);
$definitions = json_decode($json, true);
if (!is_array($definitions)) {
    sendJson([]);
    exit;
}
sendJson($definitions);
