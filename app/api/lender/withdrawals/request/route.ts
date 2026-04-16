import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

// POST /api/lender/withdrawals/request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount } = body;
    const user = await getSessionUser(request, body.userId);
    if (!user || user.user_type !== 'lender') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }
    // Check available balance
    const [profileRows] = await pool.execute<RowDataPacket[]>(
      'SELECT available_balance FROM lender_profiles WHERE user_id = ?', 
      [user.id]
    );
    const profile = profileRows.length > 0 ? profileRows[0] : null;
    if (!profile || profile.available_balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }
    // Insert withdrawal request
    await pool.execute(
      `INSERT INTO withdrawals (user_id, amount, status, created_at) VALUES (?, ?, 'pending', NOW())`,
      [user.id, amount]
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
