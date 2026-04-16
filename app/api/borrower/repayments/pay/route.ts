import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

interface RepaymentScheduleRow {
  id: number;
  loan_id: number;
  paid_amount: number;
  total_amount: number;
  status: string;
  interest_amount: number;
  principal_amount: number;
}

interface LoanRow {
  id: number;
  borrower_id: number;
  amount: number;
}

interface LenderSelectionRow {
  id: number;
  lender_id: number;
  amount_lent: number;
  amount_received: number | null;
  total_expected_return: number;
}

interface LenderProfileRow {
  commission_rate: number | null;
}

interface CountRow {
  cnt: number;
}

// POST /api/borrower/repayments/pay
export async function POST(request: NextRequest) {
  try {
    const { repaymentId, amount, userId } = await request.json();
    const user = await getSessionUser(request, userId);
    if (!user || user.user_type !== 'borrower') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!repaymentId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    // Find repayment schedule
    const scheduleRows = (await db.query(
      'SELECT id, loan_id, paid_amount, total_amount, status, interest_amount, principal_amount FROM repayment_schedules WHERE id = ? LIMIT 1',
      [repaymentId]
    )) as RepaymentScheduleRow[];
    const schedule = scheduleRows[0];
    if (!schedule) return NextResponse.json({ error: 'Repayment not found' }, { status: 404 });
    // Find loan
    const loanRows = (await db.query('SELECT id, borrower_id, amount FROM loan_requests WHERE id = ? LIMIT 1', [schedule.loan_id])) as LoanRow[];
    const loan = loanRows[0];
    if (!loan || loan.borrower_id !== user.id) return NextResponse.json({ error: 'Not your loan' }, { status: 403 });
    // Update paid amount and status
    const newPaid = Number(schedule.paid_amount) + Number(amount);
    let newStatus = schedule.status;
    if (newPaid >= schedule.total_amount) {
      newStatus = 'paid';
    } else if (newPaid > 0) {
      newStatus = 'partial';
    }
    await db.query('UPDATE repayment_schedules SET paid_amount = ?, status = ?, paid_at = CASE WHEN ? >= total_amount THEN NOW() ELSE paid_at END WHERE id = ?', [newPaid, newStatus, newPaid, repaymentId]);
    // Record transaction
    await db.query('INSERT INTO transactions (user_id, loan_id, transaction_type, amount, status, reference_id, reference_type) VALUES (?, ?, "repayment", ?, "completed", ?, "repayment_schedules")', [user.id, loan.id, amount, repaymentId]);
    
    // Credit lender(s) and platform - Updated to use loan_lender_selections
    const lenderSelections = (await db.query(
      'SELECT id, lender_id, amount_lent, amount_received, total_expected_return FROM loan_lender_selections WHERE loan_id = ?',
      [loan.id]
    )) as LenderSelectionRow[];
    if (lenderSelections.length > 0) {
      for (const selection of lenderSelections) {
        // Calculate this lender's portion of the payment
        const lenderPortion = (Number(selection.amount_lent) / Number(loan.amount)) * amount;
        const interestPortion = Number(schedule.interest_amount) * (lenderPortion / schedule.total_amount);
        const principalPortion = Number(schedule.principal_amount) * (lenderPortion / schedule.total_amount);
        
        // Platform commission (already set per lender in their profile)
        const lenderProfileRows = (await db.query(
          'SELECT commission_rate FROM lender_profiles WHERE user_id = ? LIMIT 1',
          [selection.lender_id]
        )) as LenderProfileRow[];
        const lenderProfile = lenderProfileRows[0];
        const commissionRate = lenderProfile?.commission_rate ? Number(lenderProfile.commission_rate) / 100 : 0.15;
        const platformFee = interestPortion * commissionRate;
        const lenderCredit = principalPortion + (interestPortion - platformFee);
        
        // Credit lender
        await db.query('UPDATE lender_profiles SET available_balance = available_balance + ? WHERE user_id = ?', [lenderCredit, selection.lender_id]);
        
        // Update amount_received in loan_lender_selections and mark as fully_paid if complete
        const newAmountReceived = Number(selection.amount_received || 0) + lenderCredit;
        const lenderStatus = newAmountReceived >= Number(selection.total_expected_return) ? 'fully_paid' : 'active';
        await db.query('UPDATE loan_lender_selections SET amount_received = ?, status = ? WHERE id = ?', [newAmountReceived, lenderStatus, selection.id]);
        
        // Record platform earning
        await db.query('INSERT INTO transactions (user_id, loan_id, transaction_type, amount, status, description) VALUES (?, ?, ?, ?, ?, ?)', [null, loan.id, 'fee', platformFee, 'completed', `Commission (${commissionRate * 100}%)`]);
      }
    }
    
    // If all repayments for this loan are paid, mark loan as completed
    const remainingRows = (await db.query(
      'SELECT COUNT(*) as cnt FROM repayment_schedules WHERE loan_id = ? AND status != "paid"',
      [loan.id]
    )) as CountRow[];
    const remaining = remainingRows[0];
    if (remaining && remaining.cnt === 0) {
      await db.query('UPDATE loan_requests SET status = "completed" WHERE id = ?', [loan.id]);
    }
    // Send receipt email (placeholder)
    // await sendEmail(...)
    return NextResponse.json({ success: true, newStatus });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
