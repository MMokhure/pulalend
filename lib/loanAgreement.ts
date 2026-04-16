import db from '@/lib/db';

/**
 * Generate a loan agreement record after lender confirmation.
 * Stores agreement details in loan_agreements table.
 */
export async function generateLoanAgreement(loanId: number) {
  // Fetch loan, lender, borrower, offer
  const [loan] = await db.query('SELECT * FROM loan_requests WHERE id = ?', [loanId]);
  if (!loan) throw new Error('Loan not found');
  const [offer] = await db.query('SELECT * FROM loan_offers WHERE loan_application_id = ? AND status = "approved"', [loanId]);
  if (!offer) throw new Error('Approved offer not found');
  // Insert agreement
  const [result] = await db.query(
    `INSERT INTO loan_agreements (loan_id, lender_id, borrower_id, amount, interest_rate, tenure_months, start_date, agreement_text, created_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, NOW())`,
    [loan.id, offer.lender_id, loan.borrower_id, offer.amount, offer.offered_rate, offer.tenure_months, 'Standard agreement text...']
  );
  return result.insertId;
}
