# Two-Factor Authentication (2FA) Implementation

This document describes the 2FA implementation for PulaLend using email verification.

## Overview

2FA adds an extra layer of security to user logins. After entering correct credentials, users receive a 6-digit verification code via email that expires in 10 minutes.

## Components

### 1. Database Schema
- **two_factor_codes** table: Stores verification codes
- **users.two_factor_enabled**: Boolean flag to enable/disable 2FA per user
- **users.last_2fa_at**: Timestamp of last successful 2FA verification

### 2. Email Service (`lib/emailService.ts`)
- Configured with Hostinger SMTP settings
- Sends verification codes via email
- Template includes security warnings

### 3. Two-Factor Service (`lib/twoFactorService.ts`)
- `generateAndSendCode()`: Creates and emails 6-digit code
- `verifyCode()`: Validates user-provided code
- `is2FAEnabled()`: Checks if 2FA is active for user
- `toggle2FA()`: Enables/disables 2FA
- `cleanupExpiredCodes()`: Removes old codes (run periodically)

### 4. API Endpoints

#### POST `/api/auth/2fa/send`
Request a new verification code
```json
{
  "userId": 1
}
```

#### POST `/api/auth/2fa/verify`
Verify a code
```json
{
  "userId": 1,
  "code": "123456"
}
```

#### POST `/api/auth/2fa/toggle`
Enable/disable 2FA for a user
```json
{
  "userId": 1,
  "enabled": true
}
```

### 5. Updated Login Flow (`app/api/auth/login/route.ts`)

**Step 1**: User submits email and password
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response if 2FA is enabled**:
```json
{
  "success": true,
  "requiresTwoFactor": true,
  "userId": 1,
  "message": "Verification code sent to your email"
}
```

**Step 2**: User submits email, password, and 2FA code
```json
{
  "email": "user@example.com",
  "password": "password123",
  "twoFactorCode": "123456"
}
```

**Success Response**:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "lender",
    "twoFactorEnabled": true
  },
  "message": "Login successful"
}
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install nodemailer @types/nodemailer
```

### 2. Run Database Migration
```bash
node scripts/run-2fa-migration.js
```

### 3. Configure Environment Variables
Update `.env` file with SMTP credentials:

```env
ENABLE_EMAILS=true
EMAIL_FROM=no_reply@pulalend.co.bw
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=no_reply@pulalend.co.bw
SMTP_PASSWORD=your_actual_password
```

### 4. Email Server Configuration

**Hostinger SMTP Settings:**
- Host: smtp.hostinger.com
- Port: 465
- Encryption: SSL
- Username: no_reply@pulalend.co.bw
- Password: [Your email password]

**Alternative Configurations:**
- IMAP: imap.hostinger.com:993 (SSL)
- POP3: pop.hostinger.com:995 (SSL)

### 5. Test the Implementation

1. Start the development server: `npm run dev`
2. Attempt to log in with a valid account
3. Check email for 6-digit code
4. Complete login with the code

## Security Features

- Codes expire after 10 minutes
- Codes are single-use (marked as verified)
- Old unverified codes are deleted when new ones are generated
- Users can toggle 2FA on/off
- Failed verification returns generic error message
- All 2FA events are logged

## Frontend Integration Notes

Your login component should:

1. Submit initial login with email/password
2. If response has `requiresTwoFactor: true`, show 2FA input
3. Submit again with `twoFactorCode` field
4. Handle success/error responses

Example flow:
```javascript
// Step 1: Initial login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const data = await response.json();

if (data.requiresTwoFactor) {
  // Step 2: Show 2FA input, then verify
  const code = await getUserInput(); // Get code from user
  
  const verifyResponse = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, twoFactorCode: code })
  });
  
  const result = await verifyResponse.json();
  // Handle final login result
}
```

## Maintenance

### Clean up expired codes periodically
Add to a cron job or scheduled task:
```javascript
import { TwoFactorService } from '@/lib/twoFactorService';

// Run daily
await TwoFactorService.cleanupExpiredCodes();
```

## Troubleshooting

### Emails not sending
- Verify SMTP credentials in `.env`
- Check `ENABLE_EMAILS=true`
- Review console logs for email errors
- Test SMTP connection with email provider

### Codes not working
- Check code hasn't expired (10 min limit)
- Verify code hasn't been used already
- Check database `two_factor_codes` table

### 2FA not required
- Check `users.two_factor_enabled` is TRUE
- Default is enabled for all users

## Future Enhancements

- Remember device for 30 days
- SMS-based 2FA option
- Authenticator app support (TOTP)
- Backup codes
- Admin override capability
