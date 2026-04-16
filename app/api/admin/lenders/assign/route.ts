import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

/**
 * POST /api/admin/lenders/assign
 * Assign a lender to a borrower's loan request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { loanId, lenderId } = body;

    if (!loanId || !lenderId) {
      return NextResponse.json(
        { error: "loanId and lenderId are required" },
        { status: 400 }
      );
    }

    const loanIdNum = Number(loanId);
    const lenderIdNum = Number(lenderId);

    if (!Number.isFinite(loanIdNum) || !Number.isFinite(lenderIdNum)) {
      return NextResponse.json(
        { error: "Invalid loanId or lenderId" },
        { status: 400 }
      );
    }

    // Check if loan exists and is approved
    const [loanRows] = await pool.execute<RowDataPacket[]>(
      `SELECT lr.id, lr.loan_number, lr.borrower_id, lr.amount, lr.status,
              u.first_name, u.last_name, u.email
       FROM loan_requests lr
       JOIN users u ON lr.borrower_id = u.id
       WHERE lr.id = ?`,
      [loanIdNum]
    );

    if (loanRows.length === 0) {
      return NextResponse.json(
        { error: "Loan request not found" },
        { status: 404 }
      );
    }

    const loan = loanRows[0];

    if (loan.status !== "approved" && loan.status !== "pending") {
      return NextResponse.json(
        { error: `Cannot assign lender to loan with status: ${loan.status}` },
        { status: 400 }
      );
    }

    // Check if lender exists and is verified
    const [lenderRows] = await pool.execute<RowDataPacket[]>(
      `SELECT u.id, u.email, u.first_name, u.last_name, lp.verified, lp.available_balance
       FROM users u
       JOIN lender_profiles lp ON u.id = lp.user_id
       WHERE u.id = ? AND u.user_type = 'lender'`,
      [lenderIdNum]
    );

    if (lenderRows.length === 0) {
      return NextResponse.json(
        { error: "Lender not found or not a lender account" },
        { status: 404 }
      );
    }

    const lender = lenderRows[0];

    if (!lender.verified) {
      return NextResponse.json(
        { error: "Lender is not verified" },
        { status: 400 }
      );
    }

    // Check if already assigned
    const [existingRows] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM loan_lender_selections WHERE loan_id = ? AND lender_id = ?",
      [loanIdNum, lenderIdNum]
    );

    if (existingRows.length > 0) {
      return NextResponse.json(
        { error: "Lender is already assigned to this loan" },
        { status: 400 }
      );
    }

    // Assign lender to loan
    await pool.execute(
      "INSERT INTO loan_lender_selections (loan_id, lender_id) VALUES (?, ?)",
      [loanIdNum, lenderIdNum]
    );

    // Create notification for lender
    await pool.execute(
      "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
      [
        lenderIdNum,
        "New Loan Opportunity",
        `You have been assigned to review a loan request (${loan.loan_number}) for P${Number(loan.amount).toLocaleString()}.`,
        "info"
      ]
    );

    // Create notification for borrower
    await pool.execute(
      "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
      [
        loan.borrower_id,
        "Lender Assigned",
        `A lender (${lender.first_name} ${lender.last_name}) has been assigned to review your loan request.`,
        "info"
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Lender assigned successfully",
      assignment: {
        loanId: loanIdNum,
        loanNumber: loan.loan_number,
        lenderId: lenderIdNum,
        lenderName: `${lender.first_name} ${lender.last_name}`,
        borrowerName: `${loan.first_name} ${loan.last_name}`
      }
    });
  } catch (error) {
    console.error("Lender assign error:", error);
    return NextResponse.json(
      { error: "Failed to assign lender" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/lenders/assign
 * Remove a lender assignment from a loan
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const loanId = searchParams.get("loanId");
    const lenderId = searchParams.get("lenderId");

    if (!loanId || !lenderId) {
      return NextResponse.json(
        { error: "loanId and lenderId are required" },
        { status: 400 }
      );
    }

    const loanIdNum = Number(loanId);
    const lenderIdNum = Number(lenderId);

    if (!Number.isFinite(loanIdNum) || !Number.isFinite(lenderIdNum)) {
      return NextResponse.json(
        { error: "Invalid loanId or lenderId" },
        { status: 400 }
      );
    }

    // Check if assignment exists
    const [existingRows] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM loan_lender_selections WHERE loan_id = ? AND lender_id = ?",
      [loanIdNum, lenderIdNum]
    );

    if (existingRows.length === 0) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Remove assignment
    await pool.execute(
      "DELETE FROM loan_lender_selections WHERE loan_id = ? AND lender_id = ?",
      [loanIdNum, lenderIdNum]
    );

    return NextResponse.json({
      success: true,
      message: "Lender assignment removed successfully"
    });
  } catch (error) {
    console.error("Lender unassign error:", error);
    return NextResponse.json(
      { error: "Failed to remove lender assignment" },
      { status: 500 }
    );
  }
}
