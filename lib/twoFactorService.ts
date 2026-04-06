// Two-Factor Authentication Service
// Handles generation and verification of 2FA codes

import pool from './db';
import { EmailService } from './emailService';
import { RowDataPacket } from 'mysql2';

export class TwoFactorService {
  /**
   * Generate a 6-digit random code
   */
  private static generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate and send a 2FA code to user's email
   */
  static async generateAndSendCode(userId: number, email: string, name: string): Promise<boolean> {
    try {
      const code = this.generateCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      // Delete any existing unverified codes for this user
      await pool.execute(
        'DELETE FROM two_factor_codes WHERE user_id = ? AND verified = FALSE',
        [userId]
      );

      // Insert new code
      await pool.execute(
        'INSERT INTO two_factor_codes (user_id, code, expires_at) VALUES (?, ?, ?)',
        [userId, code, expiresAt]
      );

      // Send email with the code
      const emailSent = await EmailService.send2FACode(email, name, code);

      if (!emailSent) {
        console.error('[2FA] Failed to send email to:', email);
        return false;
      }

      console.log('[2FA] Code sent successfully to:', email);
      return true;
    } catch (error) {
      console.error('[2FA] Error generating code:', error);
      return false;
    }
  }

  /**
   * Verify a 2FA code for a user
   */
  static async verifyCode(userId: number, code: string): Promise<boolean> {
    try {
      // Find valid, unverified code
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT id FROM two_factor_codes 
         WHERE user_id = ? 
         AND code = ? 
         AND verified = FALSE 
         AND expires_at > NOW()`,
        [userId, code]
      );

      if (rows.length === 0) {
        console.log('[2FA] Invalid or expired code for user:', userId);
        return false;
      }

      // Mark code as verified
      await pool.execute(
        'UPDATE two_factor_codes SET verified = TRUE WHERE id = ?',
        [rows[0].id]
      );

      // Update user's last 2FA timestamp
      await pool.execute(
        'UPDATE users SET last_2fa_at = NOW() WHERE id = ?',
        [userId]
      );

      console.log('[2FA] Code verified successfully for user:', userId);
      return true;
    } catch (error) {
      console.error('[2FA] Error verifying code:', error);
      return false;
    }
  }

  /**
   * Check if user has 2FA enabled
   */
  static async is2FAEnabled(userId: number): Promise<boolean> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT two_factor_enabled FROM users WHERE id = ?',
        [userId]
      );

      if (rows.length === 0) {
        return false;
      }

      return rows[0].two_factor_enabled === 1;
    } catch (error) {
      console.error('[2FA] Error checking 2FA status:', error);
      return true; // Default to enabled for security
    }
  }

  /**
   * Enable or disable 2FA for a user
   */
  static async toggle2FA(userId: number, enabled: boolean): Promise<boolean> {
    try {
      await pool.execute(
        'UPDATE users SET two_factor_enabled = ? WHERE id = ?',
        [enabled, userId]
      );

      console.log(`[2FA] 2FA ${enabled ? 'enabled' : 'disabled'} for user:`, userId);
      return true;
    } catch (error) {
      console.error('[2FA] Error toggling 2FA:', error);
      return false;
    }
  }

  /**
   * Clean up expired codes (should be run periodically)
   */
  static async cleanupExpiredCodes(): Promise<void> {
    try {
      await pool.execute(
        'DELETE FROM two_factor_codes WHERE expires_at < NOW()'
      );
      console.log('[2FA] Expired codes cleaned up');
    } catch (error) {
      console.error('[2FA] Error cleaning up expired codes:', error);
    }
  }
}
