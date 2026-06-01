<?php
/**
 * Email sending via PHPMailer + Hostinger SMTP
 * Run: composer install (in upwork-api folder) to install PHPMailer
 */
function getSmtpConfig() {
    $configFile = __DIR__ . '/config.smtp.php';
    if (!file_exists($configFile)) {
        return null;
    }
    return require $configFile;
}

function loadPHPMailer() {
    $autoload = __DIR__ . '/vendor/autoload.php';
    if (file_exists($autoload)) {
        require_once $autoload;
        return true;
    }
    // Fallback: manual PHPMailer (no Composer required)
    $manualPath = __DIR__ . '/vendor/phpmailer/phpmailer/src/';
    $files = ['Exception.php', 'SMTP.php', 'PHPMailer.php'];
    foreach ($files as $f) {
        if (!file_exists($manualPath . $f)) {
            return false;
        }
        require_once $manualPath . $f;
    }
    return true;
}

function sendOtpEmail($toEmail, $otp) {
    if (!loadPHPMailer()) {
        return ['success' => false, 'error' => 'PHPMailer not installed. Run: composer install OR download PHPMailer to vendor/phpmailer/phpmailer/src/'];
    }

    $config = getSmtpConfig();
    if (!$config) {
        return ['success' => false, 'error' => 'SMTP not configured. Create config.smtp.php from config.smtp.php.example'];
    }

    $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = $config['host'];
        $mail->SMTPAuth = true;
        $mail->Username = $config['username'];
        $mail->Password = $config['password'];
        $mail->SMTPSecure = $config['encryption'] ?? 'ssl';
        $mail->Port = $config['port'] ?? 465;
        $mail->CharSet = 'UTF-8';

        $mail->setFrom($config['from_email'], $config['from_name'] ?? 'TalentForge');
        $mail->addAddress($toEmail);
        $mail->Subject = 'Your TalentForge verification code';
        $mail->Body = "Your verification code is: {$otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, please ignore this email.";
        $mail->AltBody = "Your verification code is: {$otp}. This code expires in 10 minutes.";

        $mail->send();
        return ['success' => true];
    } catch (\Exception $e) {
        return ['success' => false, 'error' => $mail->ErrorInfo];
    }
}
