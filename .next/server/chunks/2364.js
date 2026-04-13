exports.id=2364,exports.ids=[2364],exports.modules={27143:(a,b,c)=>{"use strict";c.d(b,{A:()=>d});let d=c(29382).createPool({host:process.env.DB_HOST||"localhost",port:parseInt(process.env.DB_PORT||"3306"),user:process.env.DB_USER||"root",password:process.env.DB_PASSWORD||"",database:process.env.DB_NAME||"pulalend",waitForConnections:!0,connectionLimit:10,queueLimit:0})},28303:a=>{function b(a){var b=Error("Cannot find module '"+a+"'");throw b.code="MODULE_NOT_FOUND",b}b.keys=()=>[],b.resolve=b,b.id=28303,a.exports=b},55394:(a,b,c)=>{"use strict";c.d(b,{y:()=>i});var d=c(27143),e=c(66147),f=c(99646),g=c(55511),h=c.n(g);class i{static generateToken(){return h().randomBytes(32).toString("hex")}static async requestPasswordReset(a){try{let[b]=await d.A.execute("SELECT id, email, first_name, last_name, status FROM users WHERE email = ?",[a]);if(0===b.length)return console.log("[Password Reset] User not found:",a),{success:!0,message:"If an account exists with that email, a password reset link has been sent."};let c=b[0];if("active"!==c.status)return console.log("[Password Reset] Inactive account:",a),{success:!0,message:"If an account exists with that email, a password reset link has been sent."};let e=this.generateToken(),g=new Date(Date.now()+36e5);if(await d.A.execute("DELETE FROM password_reset_tokens WHERE user_id = ? AND used = FALSE",[c.id]),await d.A.execute("INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",[c.id,e,g]),!await f._.sendPasswordResetEmail(c.email,c.first_name,e))return console.error("[Password Reset] Failed to send email to:",a),{success:!1,message:"Failed to send password reset email. Please try again."};return console.log("[Password Reset] Reset email sent to:",a),{success:!0,message:"If an account exists with that email, a password reset link has been sent."}}catch(a){return console.error("[Password Reset] Error requesting reset:",a),{success:!1,message:"An error occurred. Please try again later."}}}static async verifyResetToken(a){try{let[b]=await d.A.execute(`SELECT prt.user_id, u.email, u.first_name 
         FROM password_reset_tokens prt
         JOIN users u ON prt.user_id = u.id
         WHERE prt.token = ? 
         AND prt.used = FALSE 
         AND prt.expires_at > NOW()
         AND u.status = 'active'`,[a]);if(0===b.length)return console.log("[Password Reset] Invalid or expired token"),{valid:!1};return{valid:!0,userId:b[0].user_id,email:b[0].email}}catch(a){return console.error("[Password Reset] Error verifying token:",a),{valid:!1}}}static async resetPassword(a,b){try{let c=await this.verifyResetToken(a);if(!c.valid||!c.userId)return{success:!1,message:"Invalid or expired reset token. Please request a new password reset."};let g=await (0,e.E)(b);await d.A.execute("UPDATE users SET password_hash = ?, password_changed_at = NOW() WHERE id = ?",[g,c.userId]),await d.A.execute("UPDATE password_reset_tokens SET used = TRUE, used_at = NOW() WHERE token = ?",[a]);let[h]=await d.A.execute("SELECT email, first_name FROM users WHERE id = ?",[c.userId]);return h.length>0&&await f._.sendPasswordResetConfirmation(h[0].email,h[0].first_name),console.log("[Password Reset] Password reset successful for user:",c.userId),{success:!0,message:"Your password has been reset successfully. You can now log in with your new password."}}catch(a){return console.error("[Password Reset] Error resetting password:",a),{success:!1,message:"An error occurred while resetting your password. Please try again."}}}static async cleanupExpiredTokens(){try{let[a]=await d.A.execute("DELETE FROM password_reset_tokens WHERE expires_at < NOW()");console.log("[Password Reset] Expired tokens cleaned up")}catch(a){console.error("[Password Reset] Error cleaning up expired tokens:",a)}}static async invalidateUserTokens(a){try{await d.A.execute("DELETE FROM password_reset_tokens WHERE user_id = ? AND used = FALSE",[a]),console.log("[Password Reset] Tokens invalidated for user:",a)}catch(a){console.error("[Password Reset] Error invalidating tokens:",a)}}}},66147:(a,b,c)=>{"use strict";c.d(b,{B:()=>g,E:()=>f});var d=c(87082),e=c.n(d);async function f(a){return e().hash(a,10)}async function g(a,b){return e().compare(a,b)}},78335:()=>{},96487:()=>{},99646:(a,b,c)=>{"use strict";c.d(b,{_:()=>e});var d=c(52731);class e{static{this.FROM_EMAIL=process.env.EMAIL_FROM||"no_reply@pulalend.co.bw"}static{this.ENABLED="true"===process.env.ENABLE_EMAILS}static{this.transporter=null}static getTransporter(){return this.transporter||(this.transporter=d.createTransport({host:process.env.SMTP_HOST||"smtp.hostinger.com",port:parseInt(process.env.SMTP_PORT||"465"),secure:!0,auth:{user:process.env.SMTP_USER||"no_reply@pulalend.co.bw",pass:process.env.SMTP_PASSWORD||""}})),this.transporter}static async send(a){if(!this.ENABLED)return console.log("[Email Disabled] Would send email:",{to:a.to,subject:a.subject}),!0;try{let b=this.getTransporter(),c={from:`"PulaLend" <${a.from||this.FROM_EMAIL}>`,to:a.to,subject:a.subject,html:a.html},d=await b.sendMail(c);return console.log("[Email Sent Successfully]",{messageId:d.messageId,to:a.to,subject:a.subject}),!0}catch(a){return console.error("[Email Error]",a),!1}}static async sendFundDepositConfirmation(a,b,c){let d=`
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
              <p>Hi ${b},</p>
              <p>Your account has been credited successfully.</p>
              <div class="amount">P${c.toLocaleString(void 0,{minimumFractionDigits:2})}</div>
              <p>These funds are now available in your lending account and ready to invest.</p>
              <a href="${process.env.NEXTAUTH_URL}/lender/dashboard" class="button">View Dashboard</a>
              <p>Thank you for using PulaLend!</p>
            </div>
            <div class="footer">
              <p>\xa9 2026 PulaLend. All rights reserved.</p>
              <p>Building trust in responsible lending across Botswana.</p>
            </div>
          </div>
        </body>
      </html>
    `;return this.send({to:a,subject:`Funds Added: P${c.toLocaleString()} - PulaLend`,html:d})}static async sendInvestmentConfirmation(a,b,c,d,e){let f=`
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
              <p>Hi ${b},</p>
              <p>Congratulations! Your investment has been successfully processed.</p>
              <div class="stats">
                <div class="stat">
                  <span>Loan Number:</span>
                  <strong>${c}</strong>
                </div>
                <div class="stat">
                  <span>Investment Amount:</span>
                  <strong>P${d.toLocaleString(void 0,{minimumFractionDigits:2})}</strong>
                </div>
                <div class="stat">
                  <span>Expected Return:</span>
                  <strong style="color: #16a34a;">P${e.toLocaleString(void 0,{minimumFractionDigits:2})}</strong>
                </div>
              </div>
              <a href="${process.env.NEXTAUTH_URL}/lender/investments" class="button">View My Investments</a>
              <p>You will receive notifications when repayments are made.</p>
            </div>
            <div class="footer">
              <p>\xa9 2026 PulaLend. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;return this.send({to:a,subject:`Investment Confirmed: ${c} - PulaLend`,html:f})}static async sendRepaymentReceived(a,b,c,d,e){let f=`
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
              <p>Hi ${b},</p>
              <p>Great news! A repayment has been received for loan <strong>${c}</strong>.</p>
              <div class="amount">+P${d.toLocaleString(void 0,{minimumFractionDigits:2})}</div>
              <p>Your new available balance: <strong>P${e.toLocaleString(void 0,{minimumFractionDigits:2})}</strong></p>
              <p>These funds are now available for withdrawal or reinvestment.</p>
            </div>
            <div class="footer">
              <p>\xa9 2026 PulaLend. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;return this.send({to:a,subject:`Repayment Received: ${c} - PulaLend`,html:f})}static async sendOverduePaymentAlert(a,b,c,d,e){let f=`
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
              <p>Hi ${b},</p>
              <p>This is to inform you that a payment for loan <strong>${c}</strong> is overdue.</p>
              <div class="alert">
                <p><strong>Overdue Amount:</strong> P${d.toLocaleString(void 0,{minimumFractionDigits:2})}</p>
                <p><strong>Days Past Due:</strong> ${e} days</p>
              </div>
              <p>We are monitoring this situation and will keep you updated on any developments.</p>
              <p>Your investment is protected by our risk management policies.</p>
            </div>
            <div class="footer">
              <p>\xa9 2026 PulaLend. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;return this.send({to:a,subject:`Payment Overdue: ${c} - PulaLend`,html:f})}static async send2FACode(a,b,c){let d=`
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
              <p>Hi ${b},</p>
              <p>Your verification code for logging into PulaLend is:</p>
              <div class="code">${c}</div>
              <p style="text-align: center; color: #666;">This code will expire in 10 minutes.</p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> Never share this code with anyone. PulaLend staff will never ask for your verification code.
              </div>
              <p>If you didn't request this code, please ignore this email or contact our support team immediately.</p>
            </div>
            <div class="footer">
              <p>\xa9 2026 PulaLend. All rights reserved.</p>
              <p>Building trust in responsible lending across Botswana.</p>
            </div>
          </div>
        </body>
      </html>
    `;return this.send({to:a,subject:"Your PulaLend Verification Code",html:d})}static async sendPasswordResetEmail(a,b,c){let d=`${process.env.NEXTAUTH_URL}/reset-password?token=${c}`,e=`
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
              <p>Hi ${b},</p>
              <p>We received a request to reset your password for your PulaLend account.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center;">
                <a href="${d}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <div class="token-box">${d}</div>
              <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
              </div>
            </div>
            <div class="footer">
              <p>\xa9 2026 PulaLend. All rights reserved.</p>
              <p>Building trust in responsible lending across Botswana.</p>
            </div>
          </div>
        </body>
      </html>
    `;return this.send({to:a,subject:"Reset Your PulaLend Password",html:e})}static async sendPasswordResetConfirmation(a,b){let c=`
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
              <p>Hi ${b},</p>
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
              <p>\xa9 2026 PulaLend. All rights reserved.</p>
              <p>Building trust in responsible lending across Botswana.</p>
            </div>
          </div>
        </body>
      </html>
    `;return this.send({to:a,subject:"Your PulaLend Password Has Been Changed",html:c})}}}};