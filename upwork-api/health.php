<?php
/**
 * TalentForge API - Health check
 * GET /upwork-api/health.php
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
echo json_encode(['ok' => true, 'message' => 'TalentForge API is running']);
