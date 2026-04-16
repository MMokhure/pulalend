import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

// GET /api/lender/withdrawals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const user = await getSessionUser(request, userId ? Number(userId) : undefined);
    if (!user || user.user_type !== 'lender') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Get balance
    const [profileRows] = await pool.execute<RowDataPacket[]>(
      'SELECT available_balance FROM lender_profiles WHERE user_id = ?', 
      [user.id]
    );
    const balance = profileRows.length > 0 ? profileRows[0].available_balance : 0;
    // Get withdrawal history
    const [withdrawals] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM withdrawals WHERE user_id = ? ORDER BY created_at DESC', 
      [user.id]
    );
    return NextResponse.json({ balance, withdrawals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
