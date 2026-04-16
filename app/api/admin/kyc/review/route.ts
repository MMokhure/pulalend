import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// POST /api/admin/kyc/review - Approve or reject KYC submission
export async function POST(request: NextRequest) {
  try {
    const { kycId, action, reason, userId } = await request.json(); // action: 'approve' | 'reject'
    const user = await getSessionUser(request, userId);
    if (!user || user.user_type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!kycId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    
    // Find KYC request
    const [kyc] = await db.query('SELECT * FROM kyc_requests WHERE id = ?', [kycId]);
    if (!kyc) return NextResponse.json({ error: 'KYC request not found' }, { status: 404 });
    if (kyc.status !== 'pending') return NextResponse.json({ error: 'Already processed' }, { status: 400 });
    
    if (action === 'approve') {
      // Update KYC status to approved
      await db.query(
        'UPDATE kyc_requests SET status = "approved", reviewed_at = NOW(), reviewer_id = ? WHERE id = ?',
        [user.id, kycId]
      );
      // Update borrower profile as verified
      await db.query('UPDATE borrower_profiles SET verified = TRUE WHERE user_id = ?', [kyc.user_id]);
      // Notify borrower
      await db.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [kyc.user_id, 'KYC Approved', 'Your KYC submission has been approved. You can now apply for loans.', 'success']
      );
    } else {
      // Reject KYC
      await db.query(
        'UPDATE kyc_requests SET status = "rejected", rejection_reason = ?, reviewed_at = NOW(), reviewer_id = ? WHERE id = ?',
        [reason || 'Documents not acceptable', user.id, kycId]
      );
      // Notify borrower
      await db.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [kyc.user_id, 'KYC Rejected', `Your KYC submission was rejected. Reason: ${reason || 'Documents not acceptable'}. Please resubmit with correct documents.`, 'error']
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
