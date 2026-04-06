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

function sanitizeSql(sql) {
  // Remove BOM if present
  let cleaned = sql.replace(/^\uFEFF/, "");

  // Strip single-line comments to avoid driver edge cases
  cleaned = cleaned
    .split(/\r?\n/)
    .filter((line) => {
      const t = line.trim();
      if (!t) return true;
      if (t.startsWith("--")) return false;
      return true;
    })
    .join("\n");

  return cleaned;
}

async function main() {
  const env = { ...loadEnvLocal(), ...process.env };

  const host = env.DB_HOST || "localhost";
  const port = Number(env.DB_PORT || 3306);
  const user = env.DB_USER || "root";
  const password = env.DB_PASSWORD || "";
  const database = env.DB_NAME || "pulalend";

  const schemaPath = path.join(process.cwd(), "database", "schema.sql");
  if (!fs.existsSync(schemaPath)) {
    console.error("Schema file not found:", schemaPath);
    process.exit(1);
  }

  let sql = sanitizeSql(fs.readFileSync(schemaPath, "utf8"));
  const dbSafe = String(database).replace(/`/g, "");
  const createStmt = `CREATE DATABASE IF NOT EXISTS \`${dbSafe}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`;
  const useStmt = `USE \`${dbSafe}\`;`;

  const hasCreate = /CREATE DATABASE IF NOT EXISTS/i.test(sql);
  const hasUse = /USE\s+/i.test(sql);

  if (hasCreate) {
    sql = sql.replace(/CREATE DATABASE IF NOT EXISTS[^;]+;/i, createStmt);
  }

  if (hasUse) {
    sql = sql.replace(/USE\s+[^;]+;/i, useStmt);
  }

  let prefix = "";
  if (!hasCreate) prefix += `${createStmt}\n`;
  if (!hasUse) prefix += `${useStmt}\n`;
  if (prefix) sql = `${prefix}${sql}`;

  console.log("Connecting to MySQL...", { host, port, user });
  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true,
  });

  const ensureColumn = async (tableName, columnName, columnType) => {
    const [rows] = await connection.query(
      "SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1",
      [database, tableName, columnName]
    );
    if (Array.isArray(rows) && rows.length === 0) {
      await connection.query(
        `ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${columnType}`
      );
    }
  };

  try {
    console.log("Applying schema...", schemaPath);
    await connection.query(sql);
    await ensureColumn("users", "permanent_address", "TEXT");
    await ensureColumn("users", "current_address", "TEXT");
    await ensureColumn("kyc_requests", "omang_copy_path", "VARCHAR(500)");
    await ensureColumn("kyc_requests", "payslip_path", "VARCHAR(500)");
    await ensureColumn("kyc_requests", "rejection_reason", "TEXT");
    await ensureColumn("loan_requests", "loan_number", "VARCHAR(50) UNIQUE");
    console.log("Done. Database and tables are ready.");
    console.log("Seeded admin:");
    console.log("  email: admin@pulalend.co.bw");
    console.log("  password: admin123");
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error("DB init failed:");
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
