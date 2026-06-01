<?php
/**
 * TalentForge API - Configuration
 */
define('DATA_DIR', __DIR__ . '/data');
define('USERS_FILE', DATA_DIR . '/users.json');
define('PENDING_FILE', DATA_DIR . '/pending_verifications.json');
define('OTP_EXPIRY_MINUTES', 10);

// Dynamic data (jobs, proposals, contracts, milestones)
define('JOBS_FILE', DATA_DIR . '/jobs.json');
define('PROPOSALS_FILE', DATA_DIR . '/proposals.json');
define('CONTRACTS_FILE', DATA_DIR . '/contracts.json');
define('MILESTONES_FILE', DATA_DIR . '/milestones.json');

// Freelancer exam (dynamic definitions + attempts/scores)
define('EXAM_DEFINITIONS_FILE', DATA_DIR . '/exam_definitions.json');
define('EXAM_ATTEMPTS_FILE', DATA_DIR . '/exam_attempts.json');

// Freelancer onboarding (profile completion: technology, resume, bank details)
define('ONBOARDING_FILE', DATA_DIR . '/onboarding.json');
