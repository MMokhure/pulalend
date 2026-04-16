import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { getSessionUser } from "@/lib/auth";

/**
 * GET /api/borrower/extensions
 * Get all extension requests for a borrower
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    const user = await getSessionUser(request, userId ? parseInt(userId) : undefined);
    if (!user || user.user_type !== "borrower") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [extensions] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        le.*,
        lr.loan_number,
        lr.amount as loan_amount,
        lr.status as loan_status
      FROM loan_extensions le
      JOIN loan_requests lr ON le.loan_id = lr.id
      WHERE le.borrower_id = ?
      ORDER BY le.requested_at DESC`,
      [user.id]
    );

    return NextResponse.json({ extensions });
  } catch (error: any) {
    console.error("Error fetching extensions:", error);
    return NextResponse.json(
      { error: "Failed to fetch extension requests" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/borrower/extensions
 * Request a loan extension
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { loanId, extensionDays, reason, userId } = body;

    const user = await getSessionUser(request, userId);
    if (!user || user.user_type !== "borrower") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!loanId || !extensionDays) {
      return NextResponse.json(
        { error: "Loan ID and extension days are required" },
        { status: 400 }
      );
    }

    if (extensionDays < 1 || extensionDays > 90) {
      return NextResponse.json(
        { error: "Extension days must be between 1 and 90" },
        { status: 400 }
      );
    }

    // Get loan details
    const [loanRows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        lr.id,
        lr.borrower_id,
        lr.amount,
        lr.status,
        MIN(rs.due_date) as next_due_date
      FROM loan_requests lr
      LEFT JOIN repayment_schedules rs ON lr.id = rs.loan_id AND rs.status = 'pending'
      WHERE lr.id = ?
      GROUP BY lr.id, lr.borrower_id, lr.amount, lr.status`,
      [loanId]
    );

    if (loanRows.length === 0) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    const loan = loanRows[0];

    if (loan.borrower_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (loan.status !== 'active' && loan.status !== 'funded') {
      return NextResponse.json(
        { error: "Extensions can only be requested for active loans" },
        { status: 400 }
      );
    }

    if (!loan.next_due_date) {
      return NextResponse.json(
        { error: "No pending payments found for this loan" },
        { status: 400 }
      );
    }

    // Get borrower rank
    const [profileRows] = await pool.execute<RowDataPacket[]>(
      `SELECT borrower_rank FROM borrower_profiles WHERE user_id = ?`,
      [user.id]
    );

    const borrowerRank = profileRows[0]?.borrower_rank || 'average';

    // Calculate penalty based on rank
    const penaltyRates = {
      excellent: 1.0,  // 1% penalty
      good: 2.0,       // 2% penalty
      average: 3.0,    // 3% penalty
      poor: 5.0        // 5% penalty
    };

    const penaltyPercentage = penaltyRates[borrowerRank as keyof typeof penaltyRates] || 3.0;
    const penaltyAmount = (Number(loan.amount) * penaltyPercentage) / 100;

    // Calculate new due date
    const originalDueDate = new Date(loan.next_due_date);
    const newDueDate = new Date(originalDueDate);
    newDueDate.setDate(newDueDate.getDate() + parseInt(extensionDays));

    // Create extension request
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO loan_extensions 
      (loan_id, borrower_id, original_due_date, extension_days, new_due_date, 
       penalty_percentage, penalty_amount, reason, borrower_rank, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        loanId,
        user.id,
        originalDueDate,
        extensionDays,
        newDueDate,
        penaltyPercentage,
        penaltyAmount,
        reason || null,
        borrowerRank
      ]
    );

    return NextResponse.json({
      success: true,
      extensionId: result.insertId,
      penaltyPercentage,
      penaltyAmount,
      newDueDate: newDueDate.toISOString().split('T')[0]
    });
  } catch (error: any) {
    console.error("Error creating extension:", error);
    return NextResponse.json(
      { error: "Failed to create extension request" },
      { status: 500 }
    );
  }
}
