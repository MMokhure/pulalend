(()=>{var a={};a.id=5199,a.ids=[5199],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},4573:a=>{"use strict";a.exports=require("node:buffer")},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},19121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},19771:a=>{"use strict";a.exports=require("process")},27143:(a,b,c)=>{"use strict";c.d(b,{A:()=>f,db:()=>e});let d=c(29382).createPool({host:process.env.DB_HOST||"localhost",port:parseInt(process.env.DB_PORT||"3306"),user:process.env.DB_USER||"root",password:process.env.DB_PASSWORD||"",database:process.env.DB_NAME||"pulalend",waitForConnections:!0,connectionLimit:10,queueLimit:0}),e={async query(a,b){let[c]=await d.execute(a,b);return c}},f=d},27910:a=>{"use strict";a.exports=require("stream")},28303:a=>{function b(a){var b=Error("Cannot find module '"+a+"'");throw b.code="MODULE_NOT_FOUND",b}b.keys=()=>[],b.resolve=b,b.id=28303,a.exports=b},28354:a=>{"use strict";a.exports=require("util")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},34631:a=>{"use strict";a.exports=require("tls")},41204:a=>{"use strict";a.exports=require("string_decoder")},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},53053:a=>{"use strict";a.exports=require("node:diagnostics_channel")},55511:a=>{"use strict";a.exports=require("crypto")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},66136:a=>{"use strict";a.exports=require("timers")},66830:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>C,patchFetch:()=>B,routeModule:()=>x,serverHooks:()=>A,workAsyncStorage:()=>y,workUnitAsyncStorage:()=>z});var d={};c.r(d),c.d(d,{GET:()=>w});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(10641),v=c(27143);async function w(a){try{let{searchParams:b}=new URL(a.url),c=parseInt(b.get("userId")||"0"),d=b.get("period")||"30",[e]=await v.A.query("SELECT * FROM users WHERE id = ? AND user_type = 'admin'",[c]);if(0===e.length)return u.NextResponse.json({error:"Unauthorized"},{status:403});let f=parseInt(d),g=new Date;g.setDate(g.getDate()-f);let[h]=await v.A.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE user_type = 'borrower') as totalBorrowers,
        (SELECT COUNT(*) FROM users WHERE user_type = 'lender') as totalLenders,
        (SELECT COUNT(*) FROM loan_requests) as totalLoans,
        (SELECT COUNT(*) FROM loan_requests WHERE status = 'approved') as approvedLoans,
        (SELECT COUNT(*) FROM loan_requests WHERE status = 'funded') as fundedLoans,
        (SELECT COUNT(*) FROM loan_requests WHERE status = 'completed') as completedLoans,
        (SELECT COALESCE(SUM(amount), 0) FROM loan_requests WHERE status IN ('funded', 'completed')) as totalLoanValue,
        (SELECT COALESCE(SUM(amount), 0) FROM investments) as totalInvestments,
        (SELECT COALESCE(SUM(platform_commission), 0) FROM investments) as totalCommission,
        (SELECT COUNT(*) FROM transactions WHERE created_at >= ?) as recentTransactions,
        (SELECT COUNT(*) FROM users WHERE created_at >= ?) as newUsers
    `,[g,g]),[i]=await v.A.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as loanCount,
        COALESCE(SUM(amount), 0) as loanAmount
      FROM loan_requests
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      AND status IN ('approved', 'funded', 'completed')
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month
    `),[j]=await v.A.query(`
      SELECT 
        DATE_FORMAT(invested_at, '%Y-%m') as month,
        COUNT(*) as investmentCount,
        COALESCE(SUM(amount), 0) as investmentAmount,
        COALESCE(SUM(platform_commission), 0) as commission
      FROM investments
      WHERE invested_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(invested_at, '%Y-%m')
      ORDER BY month
    `),[k]=await v.A.query(`
      SELECT 
        COUNT(*) as totalSchedules,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paidCount,
        SUM(CASE WHEN status = 'pending' AND due_date < NOW() THEN 1 ELSE 0 END) as overdueCount,
        COALESCE(SUM(amount), 0) as expectedAmount,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as paidAmount,
        COALESCE(SUM(CASE WHEN status = 'pending' AND due_date < NOW() THEN amount ELSE 0 END), 0) as overdueAmount
      FROM repayment_schedules
    `),l=k[0].expectedAmount>0?Number((k[0].paidAmount/k[0].expectedAmount*100).toFixed(2)):0,[m]=await v.A.query(`
      SELECT 
        lr.id,
        lr.loan_number,
        lr.amount,
        lr.interest_rate,
        lr.status,
        u.name as borrowerName,
        bp.business_name,
        COALESCE(SUM(rs.amount), 0) as totalRepayment,
        COALESCE(SUM(CASE WHEN rs.status = 'paid' THEN rs.amount ELSE 0 END), 0) as paidAmount
      FROM loan_requests lr
      LEFT JOIN users u ON lr.user_id = u.id
      LEFT JOIN borrower_profiles bp ON u.id = bp.user_id
      LEFT JOIN repayment_schedules rs ON lr.id = rs.loan_id
      WHERE lr.status IN ('funded', 'completed')
      GROUP BY lr.id
      ORDER BY paidAmount DESC
      LIMIT 10
    `),[n]=await v.A.query(`
      SELECT 
        'overdue_repayments' as alertType,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as amount
      FROM repayment_schedules
      WHERE status = 'pending' AND due_date < NOW()
      
      UNION ALL
      
      SELECT 
        'pending_kyc' as alertType,
        COUNT(*) as count,
        0 as amount
      FROM kyc_requests
      WHERE status = 'pending'
      
      UNION ALL
      
      SELECT 
        'pending_withdrawals' as alertType,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as amount
      FROM transactions
      WHERE transaction_type = 'withdrawal' AND status = 'pending'
    `),[o]=await v.A.query(`
      SELECT 
        DATE_FORMAT(invested_at, '%Y-%m') as month,
        COALESCE(SUM(platform_commission), 0) as commission,
        COUNT(*) as investmentCount
      FROM investments
      WHERE invested_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(invested_at, '%Y-%m')
      ORDER BY month
    `);return u.NextResponse.json({platformStats:h[0],monthlyPerformance:i,investmentPerformance:j,repaymentMetrics:{...k[0],repaymentRate:l},topLoans:m,alerts:n,revenueData:o})}catch(a){return console.error("Error fetching reports:",a),u.NextResponse.json({error:"Failed to fetch reports"},{status:500})}}let x=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/admin/reports/route",pathname:"/api/admin/reports",filename:"route",bundlePath:"app/api/admin/reports/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"C:\\Users\\Dr Mpoma\\Documents\\pulalend\\app\\api\\admin\\reports\\route.ts",nextConfigOutput:"",userland:d}),{workAsyncStorage:y,workUnitAsyncStorage:z,serverHooks:A}=x;function B(){return(0,g.patchFetch)({workAsyncStorage:y,workUnitAsyncStorage:z})}async function C(a,b,c){var d;let e="/api/admin/reports/route";"/index"===e&&(e="/");let g=await x.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:y,prerenderManifest:z,routerServerContext:A,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,resolvedPathname:D}=g,E=(0,j.normalizeAppPath)(e),F=!!(z.dynamicRoutes[E]||z.routes[D]);if(F&&!y){let a=!!z.routes[D],b=z.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||x.isDev||y||(G="/index"===(G=D)?"/":G);let H=!0===x.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:z,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>x.onRequestError(a,b,d,A)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>x.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&B&&C&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await x.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})},A),b}},l=await x.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:z,isRoutePPREnabled:!1,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",B?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),y&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(b instanceof s.NoFallbackError||await x.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}},74075:a=>{"use strict";a.exports=require("zlib")},78335:()=>{},79428:a=>{"use strict";a.exports=require("buffer")},79551:a=>{"use strict";a.exports=require("url")},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},91645:a=>{"use strict";a.exports=require("net")},94735:a=>{"use strict";a.exports=require("events")},96487:()=>{}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[1331,6497],()=>b(b.s=66830));module.exports=c})();