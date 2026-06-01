<?php
/**
 * TalentForge API - Contracts (hire = client accepts proposal)
 * GET ?jobId=xxx  or ?clientId=xxx  or ?freelancerId=xxx  → list contracts
 * POST body → create contract (client hires freelancer)
 */
require_once __DIR__ . '/functions.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(204);
    exit;
}

$jobId = isset($_GET['jobId']) ? trim($_GET['jobId']) : null;
$clientId = isset($_GET['clientId']) ? trim($_GET['clientId']) : null;
$freelancerId = isset($_GET['freelancerId']) ? trim($_GET['freelancerId']) : null;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $contracts = readJsonFile(CONTRACTS_FILE);
    if ($jobId !== null && $jobId !== '') {
        $contracts = array_values(array_filter($contracts, function ($c) use ($jobId) {
            return ($c['jobId'] ?? '') === $jobId;
        }));
    }
    if ($clientId !== null && $clientId !== '') {
        $contracts = array_values(array_filter($contracts, function ($c) use ($clientId) {
            return ($c['clientId'] ?? '') === $clientId;
        }));
    }
    if ($freelancerId !== null && $freelancerId !== '') {
        $contracts = array_values(array_filter($contracts, function ($c) use ($freelancerId) {
            return ($c['freelancerId'] ?? '') === $freelancerId;
        }));
    }
    sendJson($contracts);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = getJsonInput();
    $jobId = $input['jobId'] ?? '';
    $clientId = $input['clientId'] ?? '';
    $freelancerId = $input['freelancerId'] ?? '';
    $freelancerName = $input['freelancerName'] ?? '';
    if ($jobId === '' || $clientId === '' || $freelancerId === '' || $freelancerName === '') {
        sendJson(['success' => false, 'error' => 'jobId, clientId, freelancerId, freelancerName required']);
        exit;
    }
    $contracts = readJsonFile(CONTRACTS_FILE);
    foreach ($contracts as $c) {
        if (($c['jobId'] ?? '') === $jobId) {
            sendJson(['success' => true, 'contract' => $c]);
            exit;
        }
    }
    $newContract = [
        'id' => generateUuid(),
        'jobId' => $jobId,
        'clientId' => $clientId,
        'freelancerId' => $freelancerId,
        'freelancerName' => $freelancerName,
        'status' => 'active',
        'hiredAt' => date('c'),
    ];
    $contracts[] = $newContract;
    writeJsonFile(CONTRACTS_FILE, $contracts);
    sendJson(['success' => true, 'contract' => $newContract]);
    exit;
}

http_response_code(405);
sendJson(['success' => false, 'error' => 'Method not allowed']);
