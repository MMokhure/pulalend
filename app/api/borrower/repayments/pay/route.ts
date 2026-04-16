import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { sendEmail } from '@/lib/emailService';

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
    const [schedule] = await db.query('SELECT * FROM repayment_schedules WHERE id = ?', [repaymentId]);
    if (!schedule) return NextResponse.json({ error: 'Repayment not found' }, { status: 404 });
    // Find loan
    const [loan] = await db.query('SELECT * FROM loan_requests WHERE id = ?', [schedule.loan_id]);
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
    const [lenderSelections] = await db.query('SELECT * FROM loan_lender_selections WHERE loan_id = ?', [loan.id]);
    if (lenderSelections && lenderSelections.length > 0) {
      for (const selection of lenderSelections) {
        // Calculate this lender's portion of the payment
        const lenderPortion = (Number(selection.amount_lent) / Number(loan.amount)) * amount;
        const interestPortion = Number(schedule.interest_amount) * (lenderPortion / schedule.total_amount);
        const principalPortion = Number(schedule.principal_amount) * (lenderPortion / schedule.total_amount);
        
        // Platform commission (already set per lender in their profile)
        const [lenderProfile] = await db.query('SELECT commission_rate FROM lender_profiles WHERE user_id = ?', [selection.lender_id]);
        const commissionRate = lenderProfile && lenderProfile.commission_rate ? Number(lenderProfile.commission_rate) / 100 : 0.15;
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
    const [remaining] = await db.query('SELECT COUNT(*) as cnt FROM repayment_schedules WHERE loan_id = ? AND status != "paid"', [loan.id]);
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
