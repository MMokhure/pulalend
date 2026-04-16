import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

// GET /api/admin/withdrawals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const user = await getSessionUser(request, userId ? Number(userId) : undefined);
    if (!user || user.user_type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Get all withdrawals with lender info
    const [withdrawals] = await pool.execute<RowDataPacket[]>(
      `SELECT w.*, CONCAT(u.first_name, ' ', u.last_name) AS lender_name 
       FROM withdrawals w 
       JOIN users u ON w.user_id = u.id 
       ORDER BY w.created_at DESC`
    );
    return NextResponse.json({ withdrawals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
