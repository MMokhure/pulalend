/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

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

async function upsertUser(conn, { email, password, firstName, lastName, userType, twoFactorEnabled }) {
  const passwordHash = await bcrypt.hash(password, 10);

  await conn.execute(
    `INSERT INTO users (email, password_hash, first_name, last_name, user_type, status, email_verified, two_factor_enabled)
     VALUES (?, ?, ?, ?, ?, 'active', TRUE, ?)
     ON DUPLICATE KEY UPDATE
       password_hash = VALUES(password_hash),
       first_name = VALUES(first_name),
       last_name = VALUES(last_name),
       user_type = VALUES(user_type),
       status = 'active',
       two_factor_enabled = VALUES(two_factor_enabled)`,
    [email, passwordHash, firstName, lastName, userType, twoFactorEnabled]
  );

  const [rows] = await conn.execute("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
  if (!rows || rows.length === 0) throw new Error(`Failed to fetch user id for ${email}`);
  return rows[0].id;
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

    // Create Admin: Mpho Mokhure
    const adminId = await upsertUser(conn, {
      email: "hmokhure@gmail.com",
      password: "523Corehd@523",
      firstName: "Mpho",
      lastName: "Mokhure",
      userType: "admin",
      twoFactorEnabled: false,
    });
    console.log("Created/Updated Admin: Mpho Mokhure (ID:", adminId + ")");

    // Create Borrower: Tefo Moduke
    const borrowerId = await upsertUser(conn, {
      email: "moduke@gmail.com",
      password: "523Corehd@523",
      firstName: "Tefo",
      lastName: "Moduke",
      userType: "borrower",
      twoFactorEnabled: false,
    });
    console.log("Created/Updated Borrower: Tefo Moduke (ID:", borrowerId + ")");

    // Create borrower profile if it doesn't exist
    await conn.execute(
      `INSERT IGNORE INTO borrower_profiles (user_id, verified)
       VALUES (?, FALSE)`,
      [borrowerId]
    );

    // Create Lender: Bolokang Mpoma
    const lenderId = await upsertUser(conn, {
      email: "mpomabk@gmail.com",
      password: "523Corehd@523",
      firstName: "Bolokang",
      lastName: "Mpoma",
      userType: "lender",
      twoFactorEnabled: false,
    });
    console.log("Created/Updated Lender: Bolokang Mpoma (ID:", lenderId + ")");

    // Create lender profile if it doesn't exist
    await conn.execute(
      `INSERT IGNORE INTO lender_profiles (user_id, available_balance, total_invested, total_earned, verified)
       VALUES (?, 0.00, 0.00, 0.00, FALSE)`,
      [lenderId]
    );

    await conn.commit();

    console.log("\n✅ Successfully created/updated all users with 2FA disabled:");
    console.log("\nAdmin:");
    console.log("  Name: Mpho Mokhure");
    console.log("  Email: hmokhure@gmail.com");
    console.log("  Password: 523Corehd@523");
    console.log("  2FA: Disabled");
    
    console.log("\nBorrower:");
    console.log("  Name: Tefo Moduke");
    console.log("  Email: moduke@gmail.com");
    console.log("  Password: 523Corehd@523");
    console.log("  2FA: Disabled");
    
    console.log("\nLender:");
    console.log("  Name: Bolokang Mpoma");
    console.log("  Email: mpomabk@gmail.com");
    console.log("  Password: 523Corehd@523");
    console.log("  2FA: Disabled");
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error("❌ User creation failed:");
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
