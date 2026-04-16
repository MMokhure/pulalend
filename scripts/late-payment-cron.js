import db from '@/lib/db';
// import { sendEmail } from '@/lib/emailService';

/**
 * Scheduled task: Check overdue repayments, apply penalties, notify users, default loans after 90 days.
 */
export async function runLatePaymentCron() {
  // 1. Mark overdue repayments
  const overdue = await db.query(
    `SELECT * FROM repayment_schedules WHERE status = 'pending' AND due_date < CURDATE()`
  );
  for (const r of overdue) {
    // Calculate days overdue
    const daysOverdue = Math.floor((Date.now() - new Date(r.due_date).getTime()) / (1000 * 60 * 60 * 24));
    // Penalty: 2% per month, prorated daily
    const penalty = Number(r.total_amount) * 0.02 * (daysOverdue / 30);
    await db.query('UPDATE repayment_schedules SET status = "overdue", penalty_amount = ? WHERE id = ?', [penalty, r.id]);
    // Notify borrower (notification)
    const [loan] = await db.query('SELECT borrower_id FROM loan_requests WHERE id = ?', [r.loan_id]);
    if (loan) {
      await db.query('INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)', [loan.borrower_id, 'Repayment Overdue', `Your repayment for loan #${r.loan_id} is overdue. Penalty applied: P${penalty.toFixed(2)}.`, 'warning']);
    }
  }

  // 2. Mark loans as defaulted after 90 days overdue
  const toDefault = await db.query(
    `SELECT rs.loan_id FROM repayment_schedules rs JOIN loan_requests lr ON rs.loan_id = lr.id WHERE rs.status = 'overdue' AND DATEDIFF(CURDATE(), rs.due_date) >= 90 AND lr.status != 'defaulted'`
  );
  for (const row of toDefault) {
    await db.query('UPDATE loan_requests SET status = "defaulted" WHERE id = ?', [row.loan_id]);
    // Notify lender and borrower (notification)
    const [loan2] = await db.query('SELECT borrower_id, lender_id FROM loan_requests WHERE id = ?', [row.loan_id]);
    if (loan2) {
      await db.query('INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)', [loan2.borrower_id, 'Loan Defaulted', `Your loan #${row.loan_id} has been marked as defaulted after 90 days overdue.`, 'error']);
      await db.query('INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)', [loan2.lender_id, 'Loan Defaulted', `Loan #${row.loan_id} to your borrower has defaulted after 90 days overdue.`, 'error']);
    }
  }
}
