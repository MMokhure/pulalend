import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

// POST /api/admin/withdrawals/approve
export async function POST(request: NextRequest) {
  try {
    const { withdrawalId, action, notes, userId } = await request.json(); // action: 'approve' | 'reject'
    const user = await getSessionUser(request, userId);
    if (!user || user.user_type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!withdrawalId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    // Find withdrawal
    const [withdrawalRows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM withdrawals WHERE id = ?', 
      [withdrawalId]
    );
    if (withdrawalRows.length === 0) {
      return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
    }
    const withdrawal = withdrawalRows[0];
    if (withdrawal.status !== 'pending') {
      return NextResponse.json({ error: 'Already processed' }, { status: 400 });
    }
    
    if (action === 'approve') {
      // Deduct from lender balance
      await pool.execute(
        'UPDATE lender_profiles SET available_balance = available_balance - ? WHERE user_id = ?', 
        [withdrawal.amount, withdrawal.user_id]
      );
      // Record transaction
      await pool.execute(
        'INSERT INTO transactions (user_id, transaction_type, amount, status, description) VALUES (?, "withdrawal", ?, "completed", ?)', 
        [withdrawal.user_id, withdrawal.amount, 'Withdrawal processed']
      );
      // Update withdrawal status
      await pool.execute(
        'UPDATE withdrawals SET status = "processed", admin_notes = ?, reviewed_by = ?, reviewed_at = NOW(), processed_at = NOW() WHERE id = ?', 
        [notes || '', user.id, withdrawalId]
      );
      // Notify lender
      await pool.execute(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)', 
        [withdrawal.user_id, 'Withdrawal Approved', `Your withdrawal request of P${withdrawal.amount} has been processed.`, 'success']
      );
    } else {
      // Reject
      await pool.execute(
        'UPDATE withdrawals SET status = "rejected", admin_notes = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?', 
        [notes || '', user.id, withdrawalId]
      );
      // Notify lender
      await pool.execute(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)', 
        [withdrawal.user_id, 'Withdrawal Rejected', `Your withdrawal request of P${withdrawal.amount} was rejected. ${notes || ''}`, 'error']
      );
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
