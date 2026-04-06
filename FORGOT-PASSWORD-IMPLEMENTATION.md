# Forgot Password Implementation

Complete password reset functionality for PulaLend using secure email-based token verification.

## Overview

Users can reset their password through a secure email-based flow:
1. Request password reset by providing email
2. Receive secure reset link via email (valid for 1 hour)
3. Click link and enter new password
4. Receive confirmation email

## Components

### 1. Database Schema

**password_reset_tokens** table:
- Stores secure reset tokens
- Auto-expires after 1 hour
- Single-use tokens
- Linked to user accounts

**users** table updates:
- `password_changed_at` - Tracks last password change

### 2. Email Service ([lib/emailService.ts](lib/emailService.ts))

Added email templates:
- **sendPasswordResetEmail()** - Sends reset link with secure token
- **sendPasswordResetConfirmation()** - Confirms successful password change

### 3. Password Reset Service ([lib/passwordResetService.ts](lib/passwordResetService.ts))

Core functions:
- `requestPasswordReset(email)` - Generate token and send email
- `verifyResetToken(token)` - Validate token is still valid
- `resetPassword(token, newPassword)` - Update password
- `cleanupExpiredTokens()` - Remove old tokens (run periodically)
- `invalidateUserTokens(userId)` - Cancel all user's reset tokens

### 4. API Endpoints

#### POST `/api/auth/forgot-password`
Request a password reset

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (always 200 to prevent email enumeration):**
```json
{
  "success": true,
  "message": "If an account exists with that email, a password reset link has been sent."
}
```

#### POST `/api/auth/verify-reset-token`
Verify if a token is still valid

**Request:**
```json
{
  "token": "a1b2c3d4e5f6..."
}
```

**Response (valid):**
```json
{
  "valid": true,
  "message": "Token is valid"
}
```

**Response (invalid):**
```json
{
  "valid": false,
  "error": "Invalid or expired reset token. Please request a new password reset."
}
```

#### POST `/api/auth/reset-password`
Reset password with valid token

**Request:**
```json
{
  "token": "a1b2c3d4e5f6...",
  "password": "newPassword123"
}
```

**Response (success):**
```json
{
  "success": true,
  "message": "Your password has been reset successfully. You can now log in with your new password."
}
```

**Response (error):**
```json
{
  "error": "Invalid or expired reset token. Please request a new password reset."
}
```

## Security Features

✓ **Secure Token Generation** - 64-character cryptographic random tokens  
✓ **Token Expiration** - 1-hour validity period  
✓ **Single-use Tokens** - Marked as used after password reset  
✓ **Email Enumeration Prevention** - Returns success even if email doesn't exist  
✓ **Password Hashing** - bcrypt with 10 salt rounds  
✓ **Inactive Account Protection** - No reset emails for suspended accounts  
✓ **Auto-cleanup** - Expired tokens automatically removed  
✓ **Confirmation Emails** - User notified of password changes  

## Frontend UI Pages Needed

### 1. Forgot Password Page (`/forgot-password`)

Simple form with email input:

```tsx
<form onSubmit={handleForgotPassword}>
  <input 
    type="email" 
    name="email" 
    placeholder="Enter your email"
    required 
  />
  <button type="submit">Send Reset Link</button>
</form>
```

**Submit handler:**
```javascript
const handleForgotPassword = async (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  
  const response = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  const result = await response.json();
  
  if (result.success) {
    // Show success message
    alert('Check your email for reset instructions');
  }
};
```

### 2. Reset Password Page (`/reset-password?token=...`)

Form to enter new password:

```tsx
<form onSubmit={handleResetPassword}>
  <input 
    type="password" 
    name="password" 
    placeholder="Enter new password"
    minLength="8"
    required 
  />
  <input 
    type="password" 
    name="confirmPassword" 
    placeholder="Confirm new password"
    minLength="8"
    required 
  />
  <button type="submit">Reset Password</button>
</form>
```

**Component logic:**
```javascript
const [token, setToken] = useState('');

useEffect(() => {
  // Get token from URL
  const params = new URLSearchParams(window.location.search);
  const tokenParam = params.get('token');
  
  if (tokenParam) {
    setToken(tokenParam);
    verifyToken(tokenParam);
  }
}, []);

const verifyToken = async (token) => {
  const response = await fetch('/api/auth/verify-reset-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  
  const result = await response.json();
  
  if (!result.valid) {
    alert('Invalid or expired reset link');
    // Redirect to forgot-password page
  }
};

const handleResetPassword = async (e) => {
  e.preventDefault();
  const password = e.target.password.value;
  const confirmPassword = e.target.confirmPassword.value;
  
  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }
  
  const response = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password })
  });
  
  const result = await response.json();
  
  if (result.success) {
    alert('Password reset successful! You can now log in.');
    // Redirect to login page
    window.location.href = '/login';
  } else {
    alert(result.error);
  }
};
```

### 3. Add Link to Login Page

```tsx
<div className="forgot-password-link">
  <a href="/forgot-password">Forgot your password?</a>
</div>
```

## Email Templates

### Reset Email
- Clean, professional design
- Clear "Reset Password" button
- Plain text link as backup
- Expiration notice (1 hour)
- Security warning about unwanted requests

### Confirmation Email
- Success message
- "Log In Now" button
- Security alert for unauthorized changes
- Support contact information

## Testing the Flow

1. **Request Reset:**
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

2. **Check Email:**
- Look for email from no_reply@pulalend.co.bw
- Copy the token from the reset URL

3. **Verify Token:**
```bash
curl -X POST http://localhost:3000/api/auth/verify-reset-token \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_TOKEN_HERE"}'
```

4. **Reset Password:**
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_TOKEN_HERE","password":"newPassword123"}'
```

5. **Check Confirmation Email:**
- Verify confirmation email received

6. **Test Login:**
- Log in with new password

## Maintenance

### Periodic Cleanup (Recommended: Daily)

Add to a cron job or scheduled task:

```javascript
import { PasswordResetService } from '@/lib/passwordResetService';

// Run daily at 3 AM
await PasswordResetService.cleanupExpiredTokens();
```

Or create a cleanup API endpoint:

```typescript
// app/api/admin/cleanup-tokens/route.ts
import { PasswordResetService } from '@/lib/passwordResetService';

export async function POST() {
  await PasswordResetService.cleanupExpiredTokens();
  return Response.json({ success: true });
}
```

## Troubleshooting

### Reset emails not arriving
- Verify SMTP credentials in `.env`
- Check `ENABLE_EMAILS=true`
- Check spam/junk folder
- Review server logs for email errors

### Token invalid/expired
- Tokens expire after 1 hour
- Tokens are single-use only
- Check `password_reset_tokens` table

### Password not updating
- Verify token is valid and unused
- Check password meets minimum requirements (8+ characters)
- Review server logs for errors

## Integration with Existing Auth

The password reset system integrates seamlessly with:
- Existing user authentication
- 2FA system (works independently)
- Email service configuration

After successful password reset:
- User's old sessions remain valid (optional: invalidate on reset)
- 2FA settings unchanged
- All reset tokens for that user are invalidated

## Future Enhancements

- Rate limiting (prevent abuse)
- Password strength meter
- Password history (prevent reuse)
- Magic link login (passwordless)
- Security questions as backup
- Multi-language support
