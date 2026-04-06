// Email notification service for Pulalend
// SMTP configuration using Hostinger email service

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export class EmailService {
  private static readonly FROM_EMAIL = process.env.EMAIL_FROM || 'no_reply@pulalend.co.bw';
  private static readonly ENABLED = process.env.ENABLE_EMAILS === 'true';
  private static transporter: Transporter | null = null;

  /**
   * Initialize SMTP transporter with Hostinger configuration
   */
  private static getTransporter(): Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.hostinger.com',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: true, // SSL
        auth: {
          user: process.env.SMTP_USER || 'no_reply@pulalend.co.bw',
          pass: process.env.SMTP_PASSWORD || '',
        },
      });
    }
    return this.transporter;
  }

  /**
   * Send an email via SMTP
   */
  static async send(params: EmailParams): Promise<boolean> {
    if (!this.ENABLED) {
      console.log('[Email Disabled] Would send email:', {
        to: params.to,
        subject: params.subject,
      });
      return true;
    }

    try {
      const transporter = this.getTransporter();
      
      const mailOptions = {
        from: `"PulaLend" <${params.from || this.FROM_EMAIL}>`,
        to: params.to,
        subject: params.subject,
        html: params.html,
      };

      const info = await transporter.sendMail(mailOptions);
      
      console.log('[Email Sent Successfully]', {
        messageId: info.messageId,
        to: params.to,
        subject: params.subject,
      });

      return true;
    } catch (error) {
      console.error('[Email Error]', error);
      return false;
    }
  }

  /**
   * Send fund deposit confirmation email
   */
  static async sendFundDepositConfirmation(
    to: string,
    name: string,
    amount: number
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0a1f44; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .amount { font-size: 32px; color: #16a34a; font-weight: bold; text-align: center; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { background: #0a1f44; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>PulaLend</h1>
              <p>Funds Added Successfully</p>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Your account has been credited successfully.</p>
              <div class="amount">P${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              <p>These funds are now available in your lending account and ready to invest.</p>
              <a href="${process.env.NEXTAUTH_URL}/lender/dashboard" class="button">View Dashboard</a>
              <p>Thank you for using PulaLend!</p>
            </div>
            <div class="footer">
              <p>© 2026 PulaLend. All rights reserved.</p>
              <p>Building trust in responsible lending across Botswana.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.send({
      to,
      subject: `Funds Added: P${amount.toLocaleString()} - PulaLend`,
      html,
    });
  }

  /**
   * Send successful investment confirmation email
   */
  static async sendInvestmentConfirmation(
    to: string,
    name: string,
    loanNumber: string,
    amount: number,
    expectedReturn: number
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .stats { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .stat { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .stat:last-child { border-bottom: none; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Investment Successful</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Congratulations! Your investment has been successfully processed.</p>
              <div class="stats">
                <div class="stat">
                  <span>Loan Number:</span>
                  <strong>${loanNumber}</strong>
                </div>
                <div class="stat">
                  <span>Investment Amount:</span>
                  <strong>P${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                </div>
                <div class="stat">
                  <span>Expected Return:</span>
                  <strong style="color: #16a34a;">P${expectedReturn.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                </div>
              </div>
              <a href="${process.env.NEXTAUTH_URL}/lender/investments" class="button">View My Investments</a>
              <p>You will receive notifications when repayments are made.</p>
            </div>
            <div class="footer">
              <p>© 2026 PulaLend. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.send({
      to,
      subject: `Investment Confirmed: ${loanNumber} - PulaLend`,
      html,
    });
  }

  /**
   * Send repayment received notification
   */
  static async sendRepaymentReceived(
    to: string,
    name: string,
    loanNumber: string,
    amount: number,
    newBalance: number
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0a1f44; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .amount { font-size: 28px; color: #16a34a; font-weight: bold; text-align: center; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 Repayment Received</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Great news! A repayment has been received for loan <strong>${loanNumber}</strong>.</p>
              <div class="amount">+P${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              <p>Your new available balance: <strong>P${newBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></p>
              <p>These funds are now available for withdrawal or reinvestment.</p>
            </div>
            <div class="footer">
              <p>© 2026 PulaLend. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.send({
      to,
      subject: `Repayment Received: ${loanNumber} - PulaLend`,
      html,
    });
  }

  /**
   * Send overdue payment alert
   */
  static async sendOverduePaymentAlert(
    to: string,
    name: string,
    loanNumber: string,
    overdueAmount: number,
    daysPastDue: number
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .alert { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Payment Overdue Alert</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>This is to inform you that a payment for loan <strong>${loanNumber}</strong> is overdue.</p>
              <div class="alert">
                <p><strong>Overdue Amount:</strong> P${overdueAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                <p><strong>Days Past Due:</strong> ${daysPastDue} days</p>
              </div>
              <p>We are monitoring this situation and will keep you updated on any developments.</p>
              <p>Your investment is protected by our risk management policies.</p>
            </div>
            <div class="footer">
              <p>© 2026 PulaLend. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.send({
      to,
      subject: `Payment Overdue: ${loanNumber} - PulaLend`,
      html,
    });
  }

  /**
   * Send 2FA verification code email
   */
  static async send2FACode(
    to: string,
    name: string,
    code: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0a1f44; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .code { font-size: 36px; font-weight: bold; text-align: center; letter-spacing: 8px; margin: 30px 0; padding: 20px; background: white; border: 2px dashed #0a1f44; border-radius: 8px; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 PulaLend</h1>
              <p>Two-Factor Authentication</p>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Your verification code for logging into PulaLend is:</p>
              <div class="code">${code}</div>
              <p style="text-align: center; color: #666;">This code will expire in 10 minutes.</p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> Never share this code with anyone. PulaLend staff will never ask for your verification code.
              </div>
              <p>If you didn't request this code, please ignore this email or contact our support team immediately.</p>
            </div>
            <div class="footer">
              <p>© 2026 PulaLend. All rights reserved.</p>
              <p>Building trust in responsible lending across Botswana.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.send({
      to,
      subject: 'Your PulaLend Verification Code',
      html,
    });
  }

  /**
   * Send password reset email with reset link
   */
  static async sendPasswordResetEmail(
    to: string,
    name: string,
    resetToken: string
  ): Promise<boolean> {
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0a1f44; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .button { background: #0a1f44; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .token-box { background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0; word-break: break-all; font-family: monospace; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔑 PulaLend</h1>
              <p>Password Reset Request</p>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>We received a request to reset your password for your PulaLend account.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <div class="token-box">${resetUrl}</div>
              <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
              </div>
            </div>
            <div class="footer">
              <p>© 2026 PulaLend. All rights reserved.</p>
              <p>Building trust in responsible lending across Botswana.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.send({
      to,
      subject: 'Reset Your PulaLend Password',
      html,
    });
  }

  /**
   * Send password reset confirmation email
   */
  static async sendPasswordResetConfirmation(
    to: string,
    name: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .success { background: #dcfce7; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { background: #0a1f44; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Password Changed</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <div class="success">
                <p><strong>Success!</strong> Your password has been changed successfully.</p>
              </div>
              <p>You can now log in to your PulaLend account using your new password.</p>
              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL}/login" class="button">Log In Now</a>
              </div>
              <div class="warning">
                <strong>⚠️ Didn't make this change?</strong> If you didn't reset your password, please contact our support team immediately to secure your account.
              </div>
            </div>
            <div class="footer">
              <p>© 2026 PulaLend. All rights reserved.</p>
              <p>Building trust in responsible lending across Botswana.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.send({
      to,
      subject: 'Your PulaLend Password Has Been Changed',
      html,
    });
  }
}
