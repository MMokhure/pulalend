exports.id=1499,exports.ids=[1499],exports.modules={17909:(a,b,c)=>{"use strict";c.d(b,{f:()=>f});var d=c(27143),e=c(99646);class f{static generateCode(){return Math.floor(1e5+9e5*Math.random()).toString()}static async generateAndSendCode(a,b,c){try{let f=this.generateCode(),g=new Date(Date.now()+6e5);if(await d.A.execute("DELETE FROM two_factor_codes WHERE user_id = ? AND verified = FALSE",[a]),await d.A.execute("INSERT INTO two_factor_codes (user_id, code, expires_at) VALUES (?, ?, ?)",[a,f,g]),!await e._.send2FACode(b,c,f))return console.error("[2FA] Failed to send email to:",b),!1;return console.log("[2FA] Code sent successfully to:",b),!0}catch(a){return console.error("[2FA] Error generating code:",a),!1}}static async verifyCode(a,b){try{let[c]=await d.A.execute(`SELECT id FROM two_factor_codes 
         WHERE user_id = ? 
         AND code = ? 
         AND verified = FALSE 
         AND expires_at > NOW()`,[a,b]);if(0===c.length)return console.log("[2FA] Invalid or expired code for user:",a),!1;return await d.A.execute("UPDATE two_factor_codes SET verified = TRUE WHERE id = ?",[c[0].id]),await d.A.execute("UPDATE users SET last_2fa_at = NOW() WHERE id = ?",[a]),console.log("[2FA] Code verified successfully for user:",a),!0}catch(a){return console.error("[2FA] Error verifying code:",a),!1}}static async is2FAEnabled(a){try{let[b]=await d.A.execute("SELECT two_factor_enabled FROM users WHERE id = ?",[a]);if(0===b.length)return!1;return 1===b[0].two_factor_enabled}catch(a){return console.error("[2FA] Error checking 2FA status:",a),!0}}static async toggle2FA(a,b){try{return await d.A.execute("UPDATE users SET two_factor_enabled = ? WHERE id = ?",[b,a]),console.log(`[2FA] 2FA ${b?"enabled":"disabled"} for user:`,a),!0}catch(a){return console.error("[2FA] Error toggling 2FA:",a),!1}}static async cleanupExpiredCodes(){try{await d.A.execute("DELETE FROM two_factor_codes WHERE expires_at < NOW()"),console.log("[2FA] Expired codes cleaned up")}catch(a){console.error("[2FA] Error cleaning up expired codes:",a)}}}},27143:(a,b,c)=>{"use strict";c.d(b,{A:()=>f,db:()=>e});let d=c(29382).createPool({host:process.env.DB_HOST||"localhost",port:parseInt(process.env.DB_PORT||"3306"),user:process.env.DB_USER||"root",password:process.env.DB_PASSWORD||"",database:process.env.DB_NAME||"pulalend",waitForConnections:!0,connectionLimit:10,queueLimit:0}),e={async query(a,b){let[c]=await d.execute(a,b);return c}},f=d},28303:a=>{function b(a){var b=Error("Cannot find module '"+a+"'");throw b.code="MODULE_NOT_FOUND",b}b.keys=()=>[],b.resolve=b,b.id=28303,a.exports=b},78335:()=>{},96487:()=>{},99646:(a,b,c)=>{"use strict";c.d(b,{_:()=>e});var d=c(52731);class e{static{this.FROM_EMAIL=process.env.EMAIL_FROM||"no_reply@pulalend.co.bw"}static{this.ENABLED="true"===process.env.ENABLE_EMAILS}static{this.transporter=null}static getTransporter(){return this.transporter||(this.transporter=d.createTransport({host:process.env.SMTP_HOST||"smtp.hostinger.com",port:parseInt(process.env.SMTP_PORT||"465"),secure:!0,auth:{user:process.env.SMTP_USER||"no_reply@pulalend.co.bw",pass:process.env.SMTP_PASSWORD||""}})),this.transporter}static async send(a){if(!this.ENABLED)return console.log("[Email Disabled] Would send email:",{to:a.to,subject:a.subject}),!0;try{let b=this.getTransporter(),c={from:`"PulaLend" <${a.from||this.FROM_EMAIL}>`,to:a.to,subject:a.subject,html:a.html},d=await b.sendMail(c);return console.log("[Email Sent Successfully]",{messageId:d.messageId,to:a.to,subject:a.subject}),!0}catch(a){return console.error("[Email Error]",a),!1}}static async sendFundDepositConfirmation(a,b,c){let d=`
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