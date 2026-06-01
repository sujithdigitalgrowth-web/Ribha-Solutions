<?php
/**
 * TalentForge API - Shared functions
 */
require_once __DIR__ . '/config.php';

function sendJson($data) {
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    echo json_encode($data);
}

function ensureDataDir() {
    if (!is_dir(DATA_DIR)) {
        mkdir(DATA_DIR, 0755, true);
    }
    if (!file_exists(USERS_FILE)) {
        file_put_contents(USERS_FILE, '[]');
    }
}

function readUsers() {
    ensureDataDir();
    $data = file_get_contents(USERS_FILE);
    $users = json_decode($data, true);
    return is_array($users) ? $users : [];
}

function writeUsers($users) {
    ensureDataDir();
    file_put_contents(USERS_FILE, json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function generateUuid() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

function getJsonInput() {
    $input = file_get_contents('php://input');
    return json_decode($input, true) ?: [];
}

function generateOTP() {
    return (string) sprintf('%06d', mt_rand(0, 999999));
}

function readPendingVerifications() {
    ensureDataDir();
    if (!file_exists(PENDING_FILE)) {
        return [];
    }
    $data = file_get_contents(PENDING_FILE);
    $all = json_decode($data, true);
    if (!is_array($all)) return [];
    $now = time();
    $valid = [];
    foreach ($all as $p) {
        $created = strtotime($p['createdAt'] ?? '');
        if ($now - $created < OTP_EXPIRY_MINUTES * 60) {
            $valid[] = $p;
        }
    }
    return $valid;
}

function writePendingVerifications($pending) {
    ensureDataDir();
    file_put_contents(PENDING_FILE, json_encode($pending, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function getPendingByEmail($email) {
    $email = strtolower(trim($email));
    foreach (readPendingVerifications() as $p) {
        if (strtolower($p['email'] ?? '') === $email) {
            return $p;
        }
    }
    return null;
}

function removePendingByEmail($email) {
    $email = strtolower(trim($email));
    $all = readPendingVerifications();
    $all = array_filter($all, function ($p) use ($email) {
        return strtolower($p['email'] ?? '') !== $email;
    });
    writePendingVerifications(array_values($all));
}

/** Read JSON array from a data file (jobs, proposals, contracts, milestones) */
function readJsonFile($file) {
    ensureDataDir();
    if (!file_exists($file)) {
        return [];
    }
    $data = file_get_contents($file);
    $arr = json_decode($data, true);
    return is_array($arr) ? $arr : [];
}

/** Write JSON array to a data file */
function writeJsonFile($file, $data) {
    ensureDataDir();
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}
