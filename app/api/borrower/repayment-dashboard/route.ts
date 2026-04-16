import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// GET /api/borrower/repayment-dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const user = await getSessionUser(request, userId ? Number(userId) : undefined);
    if (!user || user.user_type !== 'borrower') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Active loans
    const loans = await db.query(
      `SELECT lr.*, la.amount AS agreement_amount, la.interest_rate, la.tenure_months
       FROM loan_requests lr
       JOIN loan_agreements la ON lr.id = la.loan_id
       WHERE lr.borrower_id = ? AND lr.status IN ('active', 'approved', 'matched')
       ORDER BY lr.created_at DESC`,
      [user.id]
    );
    // Repayment schedules
    const schedules = await db.query(
      `SELECT rs.*, lr.loan_number FROM repayment_schedules rs JOIN loan_requests lr ON rs.loan_id = lr.id WHERE lr.borrower_id = ? ORDER BY rs.due_date ASC`,
      [user.id]
    );
    // Payment history
    const payments = await db.query(
      `SELECT t.*, lr.loan_number FROM transactions t JOIN loan_requests lr ON t.loan_id = lr.id WHERE t.user_id = ? AND t.transaction_type = 'repayment' ORDER BY t.created_at DESC`,
      [user.id]
    );
    return NextResponse.json({ loans, schedules, payments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
