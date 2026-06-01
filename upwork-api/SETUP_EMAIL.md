# Email OTP Setup (Real Email Sending)

To send real OTP emails via info@ribhasolutions.com:

## 1. Install PHPMailer

**Option A – Composer (recommended):**
```bash
brew install composer   # if not installed
cd upwork-api
composer install
```

**Option B – No Composer:** PHPMailer is already included in `vendor/phpmailer/phpmailer/src/`. No extra steps needed.

Upload the `vendor/` folder to your server.

## 2. Create SMTP config

```bash
cp config.smtp.php.example config.smtp.php
```

Edit `config.smtp.php` and set your mailbox password:

```php
'password' => 'YOUR_ACTUAL_MAILBOX_PASSWORD',
```

**Do not commit config.smtp.php to git** (it contains your password). It's in .gitignore.

## 3. Hostinger SMTP settings (already in example)

- Host: smtp.hostinger.com
- Port: 465 (SSL)
- Username: info@ribhasolutions.com
- Password: the mailbox password for info@ribhasolutions.com

## 4. Deploy

Upload to your server:
- All PHP files
- `vendor/` folder (from composer install)
- `config.smtp.php` (create on server with your password)
- `data/` folder (writable)

## 5. Test

**Quick check (no email sent):**
```
https://app.ribhasolutions.com/api/test-email.php
```
Returns config status. If `success: true`, SMTP is configured.

**Send test email:**
```
https://app.ribhasolutions.com/api/test-email.php?email=your@email.com
```
Sends a real test email. Check inbox (and spam) to confirm delivery.

**Full flow:** After signup form submit, the user should receive an email at their address with the 6-digit OTP.
