<?php
/**
 * TalentForge API - Proposals
 * GET ?jobId=xxx  or ?freelancerId=xxx  → list proposals
 * POST body → submit proposal (freelancer applies)
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
$freelancerId = isset($_GET['freelancerId']) ? trim($_GET['freelancerId']) : null;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $proposals = readJsonFile(PROPOSALS_FILE);
    if ($jobId !== null && $jobId !== '') {
        $proposals = array_values(array_filter($proposals, function ($p) use ($jobId) {
            return ($p['jobId'] ?? '') === $jobId;
        }));
    }
    if ($freelancerId !== null && $freelancerId !== '') {
        $proposals = array_values(array_filter($proposals, function ($p) use ($freelancerId) {
            return ($p['freelancerId'] ?? '') === $freelancerId;
        }));
    }
    sendJson($proposals);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = getJsonInput();
    $jobId = $input['jobId'] ?? '';
    $freelancerId = $input['freelancerId'] ?? '';
    $coverLetter = $input['coverLetter'] ?? '';
    $proposedRate = $input['proposedRate'] ?? '';
    $timeline = $input['timeline'] ?? '';
    if ($jobId === '' || $freelancerId === '' || $coverLetter === '') {
        sendJson(['success' => false, 'error' => 'jobId, freelancerId, coverLetter required']);
        exit;
    }
    $proposals = readJsonFile(PROPOSALS_FILE);
    foreach ($proposals as $p) {
        if (($p['jobId'] ?? '') === $jobId && ($p['freelancerId'] ?? '') === $freelancerId) {
            sendJson(['success' => true, 'proposal' => $p]);
            exit;
        }
    }
    $newProposal = [
        'id' => generateUuid(),
        'jobId' => $jobId,
        'freelancerId' => $freelancerId,
        'freelancerName' => $input['freelancerName'] ?? null,
        'coverLetter' => $coverLetter,
        'proposedRate' => $proposedRate,
        'timeline' => $timeline,
        'ndaSigned' => !empty($input['ndaSigned']),
        'ndaSignedAt' => $input['ndaSignedAt'] ?? null,
        'ndaAddress' => $input['ndaAddress'] ?? null,
        'ndaDisclosureAccepted' => !empty($input['ndaDisclosureAccepted']),
        'ndaSignatureDataUrl' => $input['ndaSignatureDataUrl'] ?? null,
        'createdAt' => date('c'),
        'status' => 'new',
        'whyGoodFit' => $input['whyGoodFit'] ?? null,
    ];
    $proposals[] = $newProposal;
    writeJsonFile(PROPOSALS_FILE, $proposals);
    sendJson(['success' => true, 'proposal' => $newProposal]);
    exit;
}

http_response_code(405);
sendJson(['success' => false, 'error' => 'Method not allowed']);
