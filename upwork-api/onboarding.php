<?php
/**
 * TalentForge API - Freelancer onboarding (complete profile: technology, resume, bank details)
 * GET ?userId=xxx → get onboarding record for user (so we know if already completed)
 * POST body → save/update onboarding (userId, type, pan, gstin, nameAsPerBank, ifsc, accountNumber, technology?, resumeFileName?, ...)
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
    $list = readJsonFile(ONBOARDING_FILE);
    if ($userId !== null && $userId !== '') {
        $found = null;
        foreach ($list as $row) {
            if (($row['userId'] ?? '') === $userId) {
                $found = $row;
                break;
            }
        }
        sendJson($found !== null ? $found : null);
    } else {
        sendJson($list);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = getJsonInput();
    $userIdIn = $input['userId'] ?? '';
    $type = $input['type'] ?? 'individual';
    $pan = trim($input['pan'] ?? '');
    $nameAsPerBank = trim($input['nameAsPerBank'] ?? '');
    $ifsc = trim($input['ifsc'] ?? '');
    $accountNumber = trim($input['accountNumber'] ?? '');

    if ($userIdIn === '' || $pan === '' || $nameAsPerBank === '' || $ifsc === '' || $accountNumber === '') {
        sendJson(['success' => false, 'error' => 'userId, pan, nameAsPerBank, ifsc, accountNumber required']);
        exit;
    }

    $list = readJsonFile(ONBOARDING_FILE);
    $record = [
        'userId' => $userIdIn,
        'type' => $type,
        'pan' => $pan,
        'gstin' => trim($input['gstin'] ?? '') ?: null,
        'nameAsPerBank' => $nameAsPerBank,
        'ifsc' => $ifsc,
        'accountNumber' => $accountNumber,
        'technology' => isset($input['technology']) ? trim($input['technology']) : null,
        'resumeFileName' => isset($input['resumeFileName']) ? $input['resumeFileName'] : null,
        'organisationName' => isset($input['organisationName']) ? trim($input['organisationName']) : null,
        'cin' => isset($input['cin']) ? trim($input['cin']) : null,
        'companyProfileFileName' => $input['companyProfileFileName'] ?? null,
        'submittedAt' => date('c'),
    ];

    $replaced = false;
    foreach ($list as $i => $row) {
        if (($row['userId'] ?? '') === $userIdIn) {
            $list[$i] = $record;
            $replaced = true;
            break;
        }
    }
    if (!$replaced) {
        $list[] = $record;
    }
    writeJsonFile(ONBOARDING_FILE, $list);
    sendJson(['success' => true, 'onboarding' => $record]);
    exit;
}

http_response_code(405);
sendJson(['success' => false, 'error' => 'Method not allowed']);
