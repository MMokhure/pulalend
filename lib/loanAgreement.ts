import { db } from '@/lib/db';

interface LoanRow {
  id: number;
  borrower_id: number;
}

interface OfferRow {
  lender_id: number;
  amount: number;
  offered_rate: number;
  tenure_months: number;
}

interface InsertResult {
  insertId: number;
}

/**
 * Generate a loan agreement record after lender confirmation.
 * Stores agreement details in loan_agreements table.
 */
export async function generateLoanAgreement(loanId: number) {
  // Fetch loan, lender, borrower, offer
  const loanRows = (await db.query(
    'SELECT id, borrower_id FROM loan_requests WHERE id = ? LIMIT 1',
    [loanId]
  )) as LoanRow[];
  const loan = loanRows[0];
  if (!loan) throw new Error('Loan not found');
  const offerRows = (await db.query(
    'SELECT lender_id, amount, offered_rate, tenure_months FROM loan_offers WHERE loan_application_id = ? AND status = "approved" LIMIT 1',
    [loanId]
  )) as OfferRow[];
  const offer = offerRows[0];
  if (!offer) throw new Error('Approved offer not found');
  // Insert agreement
  const result = (await db.query(
    `INSERT INTO loan_agreements (loan_id, lender_id, borrower_id, amount, interest_rate, tenure_months, start_date, agreement_text, created_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, NOW())`,
    [loan.id, offer.lender_id, loan.borrower_id, offer.amount, offer.offered_rate, offer.tenure_months, 'Standard agreement text...']
  )) as InsertResult;
  return result.insertId;
}
