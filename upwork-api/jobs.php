<?php
/**
 * TalentForge API - Jobs
 * GET ?clientId=xxx  → list jobs (optional filter by clientId)
 * POST body → create job (client posts a job)
 */
require_once __DIR__ . '/functions.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(204);
    exit;
}

$clientId = isset($_GET['clientId']) ? trim($_GET['clientId']) : null;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $jobs = readJsonFile(JOBS_FILE);
    if ($clientId !== null && $clientId !== '') {
        $jobs = array_values(array_filter($jobs, function ($j) use ($clientId) {
            return ($j['clientId'] ?? '') === $clientId;
        }));
    }
    sendJson($jobs);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = getJsonInput();
    $clientId = $input['clientId'] ?? '';
    $title = $input['title'] ?? '';
    $description = $input['description'] ?? '';
    if ($clientId === '' || $title === '' || $description === '') {
        sendJson(['success' => false, 'error' => 'clientId, title, description required']);
        exit;
    }
    $jobs = readJsonFile(JOBS_FILE);
    $newJob = [
        'id' => generateUuid(),
        'clientId' => $clientId,
        'title' => $title,
        'description' => $description,
        'budget' => $input['budget'] ?? 'To be discussed',
        'projectType' => $input['projectType'] ?? 'fixed',
        'skills' => isset($input['skills']) && is_array($input['skills']) ? $input['skills'] : [],
        'category' => $input['category'] ?? 'General',
        'createdAt' => date('c'),
        'status' => 'open',
        'timeline' => $input['timeline'] ?? null,
        'deadline' => $input['deadline'] ?? null,
        'experienceLevel' => $input['experienceLevel'] ?? null,
        'projectSize' => $input['projectSize'] ?? null,
        'deliverables' => $input['deliverables'] ?? null,
        'requirements' => $input['requirements'] ?? null,
        'companyName' => $input['companyName'] ?? null,
        'contactEmail' => $input['contactEmail'] ?? null,
        'paymentTerms' => $input['paymentTerms'] ?? null,
        'requireNDA' => !empty($input['requireNDA']),
        'ndaTemplateId' => $input['ndaTemplateId'] ?? null,
        'featured' => !empty($input['featured']),
        'urgent' => !empty($input['urgent']),
        'responseTime' => $input['responseTime'] ?? null,
        'projectTags' => isset($input['projectTags']) && is_array($input['projectTags']) ? $input['projectTags'] : null,
    ];
    array_unshift($jobs, $newJob);
    writeJsonFile(JOBS_FILE, $jobs);
    sendJson(['success' => true, 'job' => $newJob]);
    exit;
}

http_response_code(405);
sendJson(['success' => false, 'error' => 'Method not allowed']);
