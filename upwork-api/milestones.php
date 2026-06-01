<?php
/**
 * TalentForge API - Milestones (client adds/submits after hire)
 * GET ?contractId=xxx  → list milestones for contract
 * POST body → add milestone (title, amount, contractId, jobId, order, description?)
 * PATCH body → update milestone status (id, status: completed|paid)
 */
require_once __DIR__ . '/functions.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(204);
    exit;
}

header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');

$contractId = isset($_GET['contractId']) ? trim($_GET['contractId']) : null;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $milestones = readJsonFile(MILESTONES_FILE);
    if ($contractId !== null && $contractId !== '') {
        $milestones = array_values(array_filter($milestones, function ($m) use ($contractId) {
            return ($m['contractId'] ?? '') === $contractId;
        }));
    }
    usort($milestones, function ($a, $b) {
        return ($a['order'] ?? 0) - ($b['order'] ?? 0);
    });
    sendJson($milestones);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = getJsonInput();
    $contractId = $input['contractId'] ?? '';
    $jobId = $input['jobId'] ?? '';
    $title = $input['title'] ?? '';
    $amount = $input['amount'] ?? '';
    $order = isset($input['order']) ? (int) $input['order'] : 0;
    if ($contractId === '' || $jobId === '' || $title === '') {
        sendJson(['success' => false, 'error' => 'contractId, jobId, title required']);
        exit;
    }
    $all = readJsonFile(MILESTONES_FILE);
    $newMilestone = [
        'id' => generateUuid(),
        'contractId' => $contractId,
        'jobId' => $jobId,
        'title' => $title,
        'description' => $input['description'] ?? '',
        'amount' => $amount,
        'status' => 'pending',
        'dueDate' => $input['dueDate'] ?? null,
        'order' => $order,
        'createdAt' => date('c'),
    ];
    $all[] = $newMilestone;
    writeJsonFile(MILESTONES_FILE, $all);
    sendJson(['success' => true, 'milestone' => $newMilestone]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
    $input = getJsonInput();
    $id = $input['id'] ?? '';
    $status = $input['status'] ?? '';
    if ($id === '' || !in_array($status, ['pending', 'in_progress', 'submitted', 'completed', 'paid', 'cancelled'], true)) {
        sendJson(['success' => false, 'error' => 'id and status (pending|in_progress|submitted|completed|paid|cancelled) required']);
        exit;
    }
    $all = readJsonFile(MILESTONES_FILE);
    $found = false;
    foreach ($all as $i => $m) {
        if (($m['id'] ?? '') === $id) {
            $all[$i]['status'] = $status;
            if ($status === 'submitted') {
                $all[$i]['submittedAt'] = date('c');
            }
            if ($status === 'completed') {
                $all[$i]['completedAt'] = date('c');
            }
            if ($status === 'paid') {
                $all[$i]['paidAt'] = date('c');
            }
            if ($status === 'cancelled') {
                $all[$i]['cancelledAt'] = date('c');
            }
            $found = true;
            sendJson(['success' => true, 'milestone' => $all[$i]]);
            break;
        }
    }
    if (!$found) {
        sendJson(['success' => false, 'error' => 'Milestone not found']);
    }
    if ($found) {
        writeJsonFile(MILESTONES_FILE, $all);
    }
    exit;
}

http_response_code(405);
sendJson(['success' => false, 'error' => 'Method not allowed']);
