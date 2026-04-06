// Password Reset Service
// Handles secure password reset token generation and validation

import pool from './db';
import { hashPassword } from './auth';
import { EmailService } from './emailService';
import { RowDataPacket } from 'mysql2';
import crypto from 'crypto';

export class PasswordResetService {
  /**
   * Generate a secure random token
   */
  private static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Request a password reset - generates token and sends email
   */
  static async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Find user by email
      const [rows] = await pool.execute<RowDataPacket[]>(
        "SELECT id, email, first_name, last_name, status FROM users WHERE email = ?",
        [email]
      );

      // Always return success to prevent email enumeration
      if (rows.length === 0) {
        console.log('[Password Reset] User not found:', email);
        return {
          success: true,
          message: 'If an account exists with that email, a password reset link has been sent.'
        };
      }

      const user = rows[0];

      // Don't send reset emails to inactive/suspended accounts
      if (user.status !== 'active') {
        console.log('[Password Reset] Inactive account:', email);
        return {
          success: true,
          message: 'If an account exists with that email, a password reset link has been sent.'
        };
      }

      // Generate reset token
      const token = this.generateToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Delete any existing unused tokens for this user
      await pool.execute(
        'DELETE FROM password_reset_tokens WHERE user_id = ? AND used = FALSE',
        [user.id]
      );

      // Insert new token
      await pool.execute(
        'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [user.id, token, expiresAt]
      );

      // Send email with reset link
      const emailSent = await EmailService.sendPasswordResetEmail(
        user.email,
        user.first_name,
        token
      );

      if (!emailSent) {
        console.error('[Password Reset] Failed to send email to:', email);
        return {
          success: false,
          message: 'Failed to send password reset email. Please try again.'
        };
      }

      console.log('[Password Reset] Reset email sent to:', email);
      return {
        success: true,
        message: 'If an account exists with that email, a password reset link has been sent.'
      };
    } catch (error) {
      console.error('[Password Reset] Error requesting reset:', error);
      return {
        success: false,
        message: 'An error occurred. Please try again later.'
      };
    }
  }

  /**
   * Verify if a reset token is valid
   */
  static async verifyResetToken(token: string): Promise<{ valid: boolean; userId?: number; email?: string }> {
    try {
      // Find valid, unused token
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT prt.user_id, u.email, u.first_name 
         FROM password_reset_tokens prt
         JOIN users u ON prt.user_id = u.id
         WHERE prt.token = ? 
         AND prt.used = FALSE 
         AND prt.expires_at > NOW()
         AND u.status = 'active'`,
        [token]
      );

      if (rows.length === 0) {
        console.log('[Password Reset] Invalid or expired token');
        return { valid: false };
      }

      return {
        valid: true,
        userId: rows[0].user_id,
        email: rows[0].email
      };
    } catch (error) {
      console.error('[Password Reset] Error verifying token:', error);
      return { valid: false };
    }
  }

  /**
   * Reset password using a valid token
   */
  static async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      // Verify token is valid
      const verification = await this.verifyResetToken(token);
      
      if (!verification.valid || !verification.userId) {
        return {
          success: false,
          message: 'Invalid or expired reset token. Please request a new password reset.'
        };
      }

      // Hash the new password
      const passwordHash = await hashPassword(newPassword);

      // Update user's password
      await pool.execute(
        'UPDATE users SET password_hash = ?, password_changed_at = NOW() WHERE id = ?',
        [passwordHash, verification.userId]
      );

      // Mark token as used
      await pool.execute(
        'UPDATE password_reset_tokens SET used = TRUE, used_at = NOW() WHERE token = ?',
        [token]
      );

      // Get user details for confirmation email
      const [userRows] = await pool.execute<RowDataPacket[]>(
        'SELECT email, first_name FROM users WHERE id = ?',
        [verification.userId]
      );

      if (userRows.length > 0) {
        // Send confirmation email
        await EmailService.sendPasswordResetConfirmation(
          userRows[0].email,
          userRows[0].first_name
        );
      }

      console.log('[Password Reset] Password reset successful for user:', verification.userId);
      return {
        success: true,
        message: 'Your password has been reset successfully. You can now log in with your new password.'
      };
    } catch (error) {
      console.error('[Password Reset] Error resetting password:', error);
      return {
        success: false,
        message: 'An error occurred while resetting your password. Please try again.'
      };
    }
  }

  /**
   * Clean up expired tokens (should be run periodically)
   */
  static async cleanupExpiredTokens(): Promise<void> {
    try {
      const [result] = await pool.execute(
        'DELETE FROM password_reset_tokens WHERE expires_at < NOW()'
      );
      console.log('[Password Reset] Expired tokens cleaned up');
    } catch (error) {
      console.error('[Password Reset] Error cleaning up expired tokens:', error);
    }
  }

  /**
   * Invalidate all reset tokens for a user (e.g., after successful login)
   */
  static async invalidateUserTokens(userId: number): Promise<void> {
    try {
      await pool.execute(
        'DELETE FROM password_reset_tokens WHERE user_id = ? AND used = FALSE',
        [userId]
      );
      console.log('[Password Reset] Tokens invalidated for user:', userId);
    } catch (error) {
      console.error('[Password Reset] Error invalidating tokens:', error);
    }
  }
}
