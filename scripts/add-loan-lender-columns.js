const mysql = require('mysql2/promise');

async function addColumns() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pulalend',
  });

  try {
    console.log('Adding columns to loan_lender_selections table...\n');
    
    // Add amount_lent column
    try {
      await pool.execute(`
        ALTER TABLE loan_lender_selections
        ADD COLUMN amount_lent DECIMAL(15, 2) DEFAULT 0 COMMENT 'Amount this lender contributed to the loan'
      `);
      console.log('✓ Added amount_lent column');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ amount_lent column already exists');
      } else {
        throw err;
      }
    }

    // Add interest_amount column
    try {
      await pool.execute(`
        ALTER TABLE loan_lender_selections
        ADD COLUMN interest_amount DECIMAL(15, 2) DEFAULT 0 COMMENT 'Interest earned by this lender'
      `);
      console.log('✓ Added interest_amount column');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ interest_amount column already exists');
      } else {
        throw err;
      }
    }

    // Add total_expected_return column
    try {
      await pool.execute(`
        ALTER TABLE loan_lender_selections
        ADD COLUMN total_expected_return DECIMAL(15, 2) DEFAULT 0 COMMENT 'Total expected return (principal + interest)'
      `);
      console.log('✓ Added total_expected_return column');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ total_expected_return column already exists');
      } else {
        throw err;
      }
    }

    // Add amount_received column
    try {
      await pool.execute(`
        ALTER TABLE loan_lender_selections
        ADD COLUMN amount_received DECIMAL(15, 2) DEFAULT 0 COMMENT 'Amount received back so far'
      `);
      console.log('✓ Added amount_received column');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ amount_received column already exists');
      } else {
        throw err;
      }
    }

    // Add status column
    try {
      await pool.execute(`
        ALTER TABLE loan_lender_selections
        ADD COLUMN status ENUM('active', 'fully_paid', 'defaulted') DEFAULT 'active' COMMENT 'Status of this lender portion'
      `);
      console.log('✓ Added status column');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ status column already exists');
      } else {
        throw err;
      }
    }

    console.log('\n✓ Migration completed successfully!');
    
    // Verify
    const [columns] = await pool.execute('DESCRIBE loan_lender_selections');
    console.log('\nUpdated table structure:');
    columns.forEach(col => console.log(`  ${col.Field}: ${col.Type}`));
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

addColumns();
