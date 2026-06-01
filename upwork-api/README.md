# TalentForge API (PHP)

PHP API for login, registration, and email OTP verification. Stores user data in `data/users.json`.

## Requirements

- PHP 7.4 or higher
- Composer (for PHPMailer)
- Apache with mod_rewrite (optional, for .htaccess)

## Setup

### 1. Install dependencies

```bash
cd upwork-api
composer install
```

### 2. Configure SMTP (for real email OTP)

Copy the example config and add your mailbox password:

```bash
cp config.smtp.php.example config.smtp.php
```

Edit `config.smtp.php` and replace `YOUR_MAILBOX_PASSWORD` with the actual password for info@ribhasolutions.com.

**Hostinger SMTP settings:**
- Host: smtp.hostinger.com
- Port: 465 (SSL) or 587 (TLS)
- Username: info@ribhasolutions.com
- Password: your mailbox password

If `config.smtp.php` is not present, OTP will fail to send and the API will return an error.

## Setup

1. Upload the `upwork-api` folder to your server (e.g. `public_html/upwork-api` on Hostinger).
2. Ensure the `data` folder is writable: `chmod 755 data` or `chmod 777 data` if needed.
3. The `data/users.json` file is created automatically on first register.

## Endpoints

Base URL: `https://app.ribhasolutions.com/api/` (or your deployment URL)

### POST send-otp.php

Send OTP for email verification during signup. Requires SMTP config.

**Request:** `{ "email": "user@example.com", "signupData": { "name": "...", "password": "...", "role": "client", "mobile": "+91...", "options": {...} } }`

### POST verify-register.php

Verify OTP and complete registration.

**Request:** `{ "email": "user@example.com", "otp": "123456" }`

### POST register.php

Register a new user (direct, without OTP).

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "client",
  "mobile": "+91 9876543210",
  "gender": "male",
  "companyName": "Acme Inc",
  "primaryCategory": "Development & IT"
}
```

**Response (success):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "client",
    "gender": "male"
  }
}
```

### POST login.php

Login with email and password.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response (success):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "client",
    "gender": "male"
  }
}
```

### GET health.php

Check if API is running.

### GET test-email.php

Verify email sending after deployment.

- `GET test-email.php` – Check SMTP config status (no email sent)
- `GET test-email.php?email=you@example.com` – Send a real test email

### POST update-profile.php

Update user profile (name, mobile). Requires email + password to verify identity.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "secret123",
  "name": "John Updated",
  "mobile": "+91 9876543210"
}
```

Provide at least one of `name` or `mobile` to update. Both are optional.

## Dynamic data (jobs, proposals, contracts, milestones)

Data is stored in `data/jobs.json`, `data/proposals.json`, `data/contracts.json`, `data/milestones.json`. The frontend merges this with seed data so both API and seed entries are shown.

### GET jobs.php

List jobs. Optional: `?clientId=xxx` to filter by client.

### POST jobs.php

Create a job (client posts a job). **Request body:** `clientId`, `title`, `description` (required); optional: `budget`, `projectType`, `skills`, `category`, `timeline`, `deadline`, etc.

### GET proposals.php

List proposals. Optional: `?jobId=xxx` or `?freelancerId=xxx`.

### POST proposals.php

Submit a proposal (freelancer applies). **Request body:** `jobId`, `freelancerId`, `coverLetter` (required); optional: `freelancerName`, `proposedRate`, `timeline`, `ndaSigned`, etc.

### GET contracts.php

List contracts (hires). Optional: `?jobId=xxx`, `?clientId=xxx`, `?freelancerId=xxx`.

### POST contracts.php

Create a contract (client hires freelancer). **Request body:** `jobId`, `clientId`, `freelancerId`, `freelancerName` (all required).

### GET milestones.php

List milestones for a contract. **Query:** `?contractId=xxx` (required).

### POST milestones.php

Add a milestone (client submits milestone after hire). **Request body:** `contractId`, `jobId`, `title` (required); optional: `description`, `amount`, `order`, `dueDate`.

### PATCH milestones.php

Update milestone status. **Request body:** `{ "id": "milestone-uuid", "status": "completed" }` or `"paid"`.

## Local Testing

Using PHP built-in server:

```bash
cd upwork-api
php -S localhost:8080
```

Then test: `http://localhost:8080/health.php`

## Hostinger Deployment

1. Upload the `upwork-api` folder to `public_html/upwork-api`.
2. Set the correct API base URL in your frontend (e.g. `https://yourdomain.com/upwork-api`).
3. Ensure `data` is writable.
