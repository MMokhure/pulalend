import db from '@/lib/db';

/**
 * Finds eligible lenders for a loan application based on:
 * - min/max loan amount
 * - available balance
 * - preferred interest rate
 *
 * Returns a ranked list of lenders by best rate.
 */
export async function matchLenders(amount: number, duration_months: number) {
  // Find lenders whose min/max loan amount covers the requested amount and have enough available balance
  const lenders = await db.query(
    `SELECT u.id, u.first_name, u.last_name, lp.available_balance, lp.preferred_interest_rate, lp.min_loan_amount, lp.max_loan_amount
     FROM users u
     JOIN lender_profiles lp ON u.id = lp.user_id
     WHERE u.user_type = 'lender'
       AND lp.available_balance >= ?
       AND lp.min_loan_amount <= ?
       AND lp.max_loan_amount >= ?
     ORDER BY lp.preferred_interest_rate ASC, lp.available_balance DESC`,
    [amount, amount, amount]
  );
  return lenders;
}
