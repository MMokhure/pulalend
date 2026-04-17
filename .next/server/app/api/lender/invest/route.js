(()=>{var a={};a.id=3892,a.ids=[3892],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},4573:a=>{"use strict";a.exports=require("node:buffer")},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},14985:a=>{"use strict";a.exports=require("dns")},19121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},19771:a=>{"use strict";a.exports=require("process")},21820:a=>{"use strict";a.exports=require("os")},27143:(a,b,c)=>{"use strict";c.d(b,{A:()=>f,db:()=>e});let d=c(29382).createPool({host:process.env.DB_HOST||"localhost",port:parseInt(process.env.DB_PORT||"3306"),user:process.env.DB_USER||"root",password:process.env.DB_PASSWORD||"",database:process.env.DB_NAME||"pulalend",waitForConnections:!0,connectionLimit:10,queueLimit:0}),e={async query(a,b){let[c]=await d.execute(a,b);return c}},f=d},27910:a=>{"use strict";a.exports=require("stream")},28303:a=>{function b(a){var b=Error("Cannot find module '"+a+"'");throw b.code="MODULE_NOT_FOUND",b}b.keys=()=>[],b.resolve=b,b.id=28303,a.exports=b},28354:a=>{"use strict";a.exports=require("util")},29021:a=>{"use strict";a.exports=require("fs")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33873:a=>{"use strict";a.exports=require("path")},34631:a=>{"use strict";a.exports=require("tls")},41204:a=>{"use strict";a.exports=require("string_decoder")},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},53053:a=>{"use strict";a.exports=require("node:diagnostics_channel")},55511:a=>{"use strict";a.exports=require("crypto")},55591:a=>{"use strict";a.exports=require("https")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},66136:a=>{"use strict";a.exports=require("timers")},74075:a=>{"use strict";a.exports=require("zlib")},78335:()=>{},79428:a=>{"use strict";a.exports=require("buffer")},79551:a=>{"use strict";a.exports=require("url")},79646:a=>{"use strict";a.exports=require("child_process")},81630:a=>{"use strict";a.exports=require("http")},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},87924:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>E,patchFetch:()=>D,routeModule:()=>z,serverHooks:()=>C,workAsyncStorage:()=>A,workUnitAsyncStorage:()=>B});var d={};c.r(d),c.d(d,{POST:()=>y});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(10641),v=c(27143),w=c(99646);function x(a,b){let c=new Date(a);return c.setMonth(c.getMonth()+b),c}async function y(a){try{let{userId:b,loanId:c,amount:d}=await a.json();if(!b||!c||!d)return u.NextResponse.json({error:"userId, loanId and amount are required"},{status:400});let e=Number(b),f=Number(c),g=Number(d);if(!Number.isFinite(e)||!Number.isFinite(f)||!Number.isFinite(g))return u.NextResponse.json({error:"Invalid numeric input"},{status:400});if(g<=0)return u.NextResponse.json({error:"Amount must be > 0"},{status:400});let[h]=await v.A.execute("SELECT id, user_type, email, first_name, last_name FROM users WHERE id = ?",[e]);if(0===h.length||"lender"!==h[0].user_type)return u.NextResponse.json({error:"Forbidden"},{status:403});let i=h[0],[j]=await v.A.execute(`SELECT id, loan_number AS loanNumber, borrower_id AS borrowerId, amount, interest_rate AS interestRate, duration_months AS durationMonths, status
       FROM loan_requests
       WHERE id = ?`,[f]);if(0===j.length)return u.NextResponse.json({error:"Loan not found"},{status:404});let k=j[0];if("approved"!==k.status)return u.NextResponse.json({error:"Loan is not open for funding"},{status:400});let[l]=await v.A.execute("SELECT commission_rate FROM lender_profiles WHERE user_id = ?",[e]),m=l.length>0&&l[0].commission_rate?Number(l[0].commission_rate)/100:.02,[n]=await v.A.execute("SELECT COALESCE(SUM(amount),0) AS fundedAmount FROM investments WHERE loan_id = ?",[f]),o=Number(k.amount),p=Number(n?.[0]?.fundedAmount??0),q=o-p;if(g>q)return u.NextResponse.json({error:`Amount exceeds remaining funding (P${q.toFixed(2)})`},{status:400});let r=Number(k.durationMonths),s=Number(k.interestRate),t=s/100*g*(r/12),y=t*m,z=t-y,A=g+z,B=await v.A.getConnection();try{await B.beginTransaction();let[a]=await B.execute(`INSERT INTO investments (lender_id, loan_id, amount, expected_return, actual_return, platform_commission, status)
         VALUES (?, ?, ?, ?, 0, ?, 'active')`,[e,f,g,A,y]),b=a.insertId;await B.execute(`INSERT INTO transactions (user_id, transaction_type, amount, reference_id, reference_type, description, status)
         VALUES (?, 'investment', ?, ?, 'investment', ?, 'completed')`,[e,g,b,`Investment in loan #${f} (${(100*m).toFixed(2)}% platform fee from profit: P${y.toFixed(2)})`]);let c=p+g>=o;if(c){await B.execute("UPDATE loan_requests SET status='active', funded_at=NOW(), updated_at=NOW() WHERE id = ?",[f]);let a=o/r,b=s/100*o*(r/12)/r,c=a+b,d=x(new Date,1);for(let e=1;e<=r;e++){let g=x(d,e-1).toISOString().slice(0,10);await B.execute(`INSERT INTO repayment_schedules
               (loan_id, installment_number, due_date, principal_amount, interest_amount, total_amount, paid_amount, status)
             VALUES (?, ?, ?, ?, ?, ?, 0, 'pending')`,[f,e,g,a,b,c])}}return await B.commit(),w._.sendInvestmentConfirmation(i.email,`${i.first_name} ${i.last_name}`,k.loanNumber,g,A).catch(a=>console.error("Email send error:",a)),u.NextResponse.json({success:!0,fullyFunded:c,platformCommission:y,investedAmount:g,commissionRate:(100*m).toFixed(2)+"%"})}catch(a){throw await B.rollback(),a}finally{B.release()}}catch(a){return console.error("Invest error:",a),u.NextResponse.json({error:"Failed to fund loan"},{status:500})}}let z=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/lender/invest/route",pathname:"/api/lender/invest",filename:"route",bundlePath:"app/api/lender/invest/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"C:\\Users\\Dr Mpoma\\Documents\\pulalend\\app\\api\\lender\\invest\\route.ts",nextConfigOutput:"",userland:d}),{workAsyncStorage:A,workUnitAsyncStorage:B,serverHooks:C}=z;function D(){return(0,g.patchFetch)({workAsyncStorage:A,workUnitAsyncStorage:B})}async function E(a,b,c){var d;let e="/api/lender/invest/route";"/index"===e&&(e="/");let g=await z.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:x,prerenderManifest:y,routerServerContext:A,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,resolvedPathname:D}=g,E=(0,j.normalizeAppPath)(e),F=!!(y.dynamicRoutes[E]||y.routes[D]);if(F&&!x){let a=!!y.routes[D],b=y.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||z.isDev||x||(G="/index"===(G=D)?"/":G);let H=!0===z.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:y,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>z.onRequestError(a,b,d,A)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>z.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&B&&C&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await z.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})},A),b}},l=await z.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",B?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),x&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(b instanceof s.NoFallbackError||await z.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}},91645:a=>{"use strict";a.exports=require("net")},94735:a=>{"use strict";a.exports=require("events")},96487:()=>{},99646:(a,b,c)=>{"use strict";c.d(b,{_:()=>e});var d=c(52731);class e{static{this.FROM_EMAIL=process.env.EMAIL_FROM||"no_reply@pulalend.co.bw"}static{this.ENABLED="true"===process.env.ENABLE_EMAILS}static{this.transporter=null}static getTransporter(){return this.transporter||(this.transporter=d.createTransport({host:process.env.SMTP_HOST||"smtp.hostinger.com",port:parseInt(process.env.SMTP_PORT||"465"),secure:!0,auth:{user:process.env.SMTP_USER||"no_reply@pulalend.co.bw",pass:process.env.SMTP_PASSWORD||""}})),this.transporter}static async send(a){if(!this.ENABLED)return console.log("[Email Disabled] Would send email:",{to:a.to,subject:a.subject}),!0;try{let b=this.getTransporter(),c={from:`"PulaLend" <${a.from||this.FROM_EMAIL}>`,to:a.to,subject:a.subject,html:a.html},d=await b.sendMail(c);return console.log("[Email Sent Successfully]",{messageId:d.messageId,to:a.to,subject:a.subject}),!0}catch(a){return console.error("[Email Error]",a),!1}}static async sendFundDepositConfirmation(a,b,c){let d=`
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
    `;return this.send({to:a,subject:"Your PulaLend Password Has Been Changed",html:c})}}}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[1331,6497,5112],()=>b(b.s=87924));module.exports=c})();