import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pulalend',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Helper function for backwards compatibility with routes using db.query()
export const db = {
  async query(sql: string, params?: any[]) {
    const [rows] = await pool.execute(sql, params);
    return rows;
  }
};

export default pool;
