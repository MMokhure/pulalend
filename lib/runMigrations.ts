/**
 * Idempotent database migrations — safe to run on every server startup.
 * Each migration checks whether the change is needed before applying it.
 */
import pool from './db';
import { RowDataPacket } from 'mysql2';

async function columnExists(conn: any, table: string, column: string): Promise<boolean> {
  const [rows] = await (conn.execute as any)(
    `SHOW COLUMNS FROM \`${table}\` WHERE Field = ?`,
    [column]
  );
  return (rows as RowDataPacket[]).length > 0;
}

async function tableExists(conn: any, table: string): Promise<boolean> {
  const [rows] = await (conn.execute as any)(
    `SHOW TABLES LIKE ?`,
    [table]
  );
  return (rows as RowDataPacket[]).length > 0;
}

async function indexExists(conn: any, table: string, indexName: string): Promise<boolean> {
  try {
    const [rows] = await (conn.execute as any)(
      `SHOW INDEX FROM \`${table}\` WHERE Key_name = ?`,
      [indexName]
    );
    return (rows as RowDataPacket[]).length > 0;
  } catch {
    return false;
  }
}

export async function runMigrations(): Promise<{ applied: string[]; errors: string[] }> {
  const applied: string[] = [];
  const errors: string[] = [];
  let connection: any;

  try {
    connection = await pool.getConnection();

    // --- lender_profiles: preferences & tracking columns ---
    for (const [col, ddl] of [
      ['preferred_interest_rate', 'DECIMAL(5,2) DEFAULT 12.00'],
      ['min_loan_amount',         'DECIMAL(15,2) DEFAULT 1000.00'],
      ['max_loan_amount',         'DECIMAL(15,2) DEFAULT 50000.00'],
      ['commission_rate',         'DECIMAL(5,2) DEFAULT 2.00'],
    ] as [string, string][]) {
      if (!(await columnExists(connection, 'lender_profiles', col))) {
        await connection.execute(`ALTER TABLE lender_profiles ADD COLUMN ${col} ${ddl}`);
        applied.push(`lender_profiles.${col}`);
      }
    }

    // --- investments: platform_commission ---
    if (!(await columnExists(connection, 'investments', 'platform_commission'))) {
      await connection.execute(`ALTER TABLE investments ADD COLUMN platform_commission DECIMAL(15,2) DEFAULT 0.00`);
      applied.push('investments.platform_commission');
    }

    // --- loan_lender_selections: lender amount tracking ---
    for (const [col, ddl] of [
      ['amount_lent',          'DECIMAL(15,2) DEFAULT 0'],
      ['interest_amount',      'DECIMAL(15,2) DEFAULT 0'],
      ['total_expected_return','DECIMAL(15,2) DEFAULT 0'],
      ['amount_received',      'DECIMAL(15,2) DEFAULT 0'],
      ['status',               "ENUM('active','fully_paid','defaulted') DEFAULT 'active'"],
    ] as [string, string][]) {
      if (!(await columnExists(connection, 'loan_lender_selections', col))) {
        await connection.execute(`ALTER TABLE loan_lender_selections ADD COLUMN ${col} ${ddl}`);
        applied.push(`loan_lender_selections.${col}`);
      }
    }
    // Drop obsolete unique constraint that prevents multi-lender loans
    if (await indexExists(connection, 'loan_lender_selections', 'uniq_loan_lender')) {
      await connection.execute(`ALTER TABLE loan_lender_selections DROP INDEX uniq_loan_lender`);
      applied.push('loan_lender_selections: dropped uniq_loan_lender');
    }

    // --- loan_requests: approved_by / approved_at ---
    if (!(await columnExists(connection, 'loan_requests', 'approved_by'))) {
      await connection.execute(`ALTER TABLE loan_requests ADD COLUMN approved_by INT NULL`);
      applied.push('loan_requests.approved_by');
    }
    if (!(await columnExists(connection, 'loan_requests', 'approved_at'))) {
      await connection.execute(`ALTER TABLE loan_requests ADD COLUMN approved_at TIMESTAMP NULL`);
      applied.push('loan_requests.approved_at');
    }

    // --- users: 2FA columns ---
    if (!(await columnExists(connection, 'users', 'two_factor_enabled'))) {
      await connection.execute(`ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE`);
      applied.push('users.two_factor_enabled');
    }
    if (!(await columnExists(connection, 'users', 'last_2fa_at'))) {
      await connection.execute(`ALTER TABLE users ADD COLUMN last_2fa_at TIMESTAMP NULL`);
      applied.push('users.last_2fa_at');
    }

    // --- two_factor_codes table ---
    if (!(await tableExists(connection, 'two_factor_codes'))) {
      await connection.execute(`
        CREATE TABLE two_factor_codes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          code VARCHAR(6) NOT NULL,
          verified BOOLEAN DEFAULT FALSE,
          expires_at DATETIME NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_id (user_id),
          INDEX idx_code (code),
          INDEX idx_expires (expires_at)
        ) ENGINE=InnoDB`);
      applied.push('table: two_factor_codes');
    }

    // --- notifications: action columns ---
    if (!(await columnExists(connection, 'notifications', 'action_url'))) {
      await connection.execute(`ALTER TABLE notifications ADD COLUMN action_url VARCHAR(500) NULL`);
      applied.push('notifications.action_url');
    }
    if (!(await columnExists(connection, 'notifications', 'action_label'))) {
      await connection.execute(`ALTER TABLE notifications ADD COLUMN action_label VARCHAR(100) NULL`);
      applied.push('notifications.action_label');
    }

    // --- withdrawals table ---
    if (!(await tableExists(connection, 'withdrawals'))) {
      await connection.execute(`
        CREATE TABLE withdrawals (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          amount DECIMAL(15,2) NOT NULL,
          status ENUM('pending','approved','rejected','processed') DEFAULT 'pending',
          admin_notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          reviewed_at TIMESTAMP NULL,
          reviewed_by INT NULL,
          processed_at TIMESTAMP NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
          INDEX idx_status (status),
          INDEX idx_user (user_id)
        ) ENGINE=InnoDB`);
      applied.push('table: withdrawals');
    }

    // --- transactions: loan_id + nullable user_id + fee enum value ---
    if (!(await columnExists(connection, 'transactions', 'loan_id'))) {
      await connection.execute(`ALTER TABLE transactions ADD COLUMN loan_id INT NULL`);
      applied.push('transactions.loan_id');
    }
    try {
      await connection.execute(`ALTER TABLE transactions MODIFY COLUMN user_id INT NULL`);
      applied.push('transactions.user_id: nullable');
    } catch { /* already nullable */ }
    try {
      await connection.execute(`ALTER TABLE transactions MODIFY COLUMN transaction_type ENUM('deposit','withdrawal','investment','repayment','return','fee') NOT NULL`);
      applied.push('transactions.transaction_type: added fee');
    } catch { /* already includes fee */ }

    // --- password_reset_tokens table ---
    if (!(await tableExists(connection, 'password_reset_tokens'))) {
      await connection.execute(`
        CREATE TABLE password_reset_tokens (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          token VARCHAR(255) NOT NULL,
          expires_at DATETIME NOT NULL,
          used BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_token (token),
          INDEX idx_user_id (user_id)
        ) ENGINE=InnoDB`);
      applied.push('table: password_reset_tokens');
    }

    // --- loan_agreements table ---
    if (!(await tableExists(connection, 'loan_agreements'))) {
      await connection.execute(`
        CREATE TABLE loan_agreements (
          id INT AUTO_INCREMENT PRIMARY KEY,
          loan_id INT NOT NULL,
          lender_id INT,
          borrower_id INT NOT NULL,
          amount DECIMAL(15,2) NOT NULL,
          interest_rate DECIMAL(5,2) NOT NULL,
          tenure_months INT NOT NULL,
          start_date TIMESTAMP,
          agreement_text TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (loan_id) REFERENCES loan_requests(id) ON DELETE CASCADE,
          FOREIGN KEY (borrower_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB`);
      applied.push('table: loan_agreements');
    }

    connection.release();
  } catch (err: any) {
    if (connection) connection.release();
    errors.push(err.message);
    console.error('[migrations] error:', err.message);
  }

  if (applied.length > 0) {
    console.log('[migrations] applied:', applied.join(', '));
  }

  return { applied, errors };
}
