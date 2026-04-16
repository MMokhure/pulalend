import db from '@/lib/db';

/**
 * Create repayment schedule entries for a loan.
 * Assumes simple interest, equal monthly payments.
 */
export async function createRepaymentSchedule(loanId: number, amount: number, interestRate: number, tenureMonths: number) {
  const monthlyInterest = (amount * (interestRate / 100)) / 12;
  const monthlyPrincipal = amount / tenureMonths;
  const monthlyTotal = monthlyPrincipal + monthlyInterest;
  const today = new Date();
  for (let i = 1; i <= tenureMonths; i++) {
    const dueDate = new Date(today.getFullYear(), today.getMonth() + i, today.getDate());
    await db.query(
      `INSERT INTO repayment_schedules (loan_id, installment_number, due_date, principal_amount, interest_amount, total_amount, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [loanId, i, dueDate.toISOString().slice(0, 10), monthlyPrincipal, monthlyInterest, monthlyTotal]
    );
  }
}
