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
    // Disable 2FA for all users
    const [result] = await conn.execute(
      'UPDATE users SET two_factor_enabled = FALSE WHERE two_factor_enabled = TRUE'
    );
    
    console.log(`\n✅ Disabled 2FA for ${result.affectedRows} user(s)`);
    
    // Show current status
    const [users] = await conn.execute(
      'SELECT id, email, user_type, two_factor_enabled FROM users ORDER BY id'
    );
    
    console.log('\n📊 Current User 2FA Status:');
    console.log('ID | Email | Type | 2FA Enabled');
    console.log('---|-------|------|------------');
    users.forEach(u => {
      console.log(`${u.id} | ${u.email} | ${u.user_type} | ${u.two_factor_enabled ? 'Yes' : 'No'}`);
    });
  } catch (err) {
    throw err;
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error("❌ Failed to disable 2FA:");
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
