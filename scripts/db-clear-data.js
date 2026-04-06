/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return {};
  const raw = fs.readFileSync(envPath, "utf8");

  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

async function main() {
  const env = { ...loadEnvLocal(), ...process.env };

  const host = env.DB_HOST || "localhost";
  const port = Number(env.DB_PORT || 3306);
  const user = env.DB_USER || "root";
  const password = env.DB_PASSWORD || "";
  const database = env.DB_NAME || "pulalend";

  console.log("Connecting to MySQL...", { host, port, user, database });
  const conn = await mysql.createConnection({ host, port, user, password, database });

  try {
    await conn.beginTransaction();

    console.log("Clearing all data from tables...");

    // Delete in reverse order of dependencies
    await conn.execute("DELETE FROM notifications");
    console.log("  ✓ Cleared notifications");

    await conn.execute("DELETE FROM kyc_requests");
    console.log("  ✓ Cleared kyc_requests");

    await conn.execute("DELETE FROM documents");
    console.log("  ✓ Cleared documents");

    await conn.execute("DELETE FROM transactions");
    console.log("  ✓ Cleared transactions");

    await conn.execute("DELETE FROM repayment_schedules");
    console.log("  ✓ Cleared repayment_schedules");

    await conn.execute("DELETE FROM investments");
    console.log("  ✓ Cleared investments");

    await conn.execute("DELETE FROM loan_lender_selections");
    console.log("  ✓ Cleared loan_lender_selections");

    await conn.execute("DELETE FROM loan_requests");
    console.log("  ✓ Cleared loan_requests");

    await conn.execute("DELETE FROM lender_profiles");
    console.log("  ✓ Cleared lender_profiles");

    await conn.execute("DELETE FROM borrower_profiles");
    console.log("  ✓ Cleared borrower_profiles");

    // Delete demo users but keep admin
    await conn.execute("DELETE FROM users WHERE email != 'admin@pulalend.co.bw'");
    console.log("  ✓ Cleared demo users (kept admin)");

    // Reset auto increment counters
    await conn.execute("ALTER TABLE users AUTO_INCREMENT = 1");
    await conn.execute("ALTER TABLE borrower_profiles AUTO_INCREMENT = 1");
    await conn.execute("ALTER TABLE lender_profiles AUTO_INCREMENT = 1");
    await conn.execute("ALTER TABLE loan_requests AUTO_INCREMENT = 1");
    await conn.execute("ALTER TABLE loan_lender_selections AUTO_INCREMENT = 1");
    await conn.execute("ALTER TABLE investments AUTO_INCREMENT = 1");
    await conn.execute("ALTER TABLE repayment_schedules AUTO_INCREMENT = 1");
    await conn.execute("ALTER TABLE transactions AUTO_INCREMENT = 1");
    await conn.execute("ALTER TABLE documents AUTO_INCREMENT = 1");
    await conn.execute("ALTER TABLE kyc_requests AUTO_INCREMENT = 1");
    await conn.execute("ALTER TABLE notifications AUTO_INCREMENT = 1");
    console.log("  ✓ Reset auto increment counters");

    await conn.commit();

    console.log("\n✅ Database cleared successfully!");
    console.log("Only admin account remains:");
    console.log("  email: admin@pulalend.co.bw");
    console.log("  password: admin123");
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error("DB clear failed:");
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
