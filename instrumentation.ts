/**
 * Next.js instrumentation hook — runs once when the server boots.
 * We use it to apply any pending database migrations automatically
 * so the production database stays in sync with the codebase.
 * 
 * TEMPORARILY DISABLED - uncomment when ready to enable auto-migrations
 */
export async function register() {
  // Only run in the Node.js runtime (not on the Edge)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('[startup] Instrumentation hook loaded (migrations disabled)');
    // Temporarily disabled to diagnose server startup issues
    // Uncomment below to enable auto-migrations:
    /*
    try {
      const { runMigrations } = await import('@/lib/runMigrations');
      const { applied, errors } = await runMigrations();
      if (applied.length > 0) {
        console.log(`[startup] DB migrations applied: ${applied.join(', ')}`);
      } else {
        console.log('[startup] DB schema up to date');
      }
      if (errors.length > 0) {
        console.error('[startup] Migration errors:', errors);
      }
    } catch (err) {
      // Never crash the server due to migration failure
      console.error('[startup] Migration hook failed:', err);
    }
    */
  }
}
