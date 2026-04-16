import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// GET: Fetch pending loan applications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    // Verify admin
    const [adminRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, user_type FROM users WHERE id = ? AND user_type = 'admin'`,
      [Number(userId)]
    );

    if (adminRows.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get pending loans that don't have lenders assigned yet
    const [loanRows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        lr.id,
        lr.loan_number,
        lr.borrower_id,
        lr.amount,
        lr.interest_rate,
        lr.duration_months,
        lr.purpose,
        lr.risk_grade,
        lr.status,
        lr.created_at,
        u.first_name,
        u.last_name,
        u.email,
        bp.credit_score,
        bp.employment_status,
        bp.monthly_income,
        (SELECT COUNT(*) FROM loan_lender_selections WHERE loan_id = lr.id) as lenders_assigned
      FROM loan_requests lr
      INNER JOIN users u ON u.id = lr.borrower_id
      LEFT JOIN borrower_profiles bp ON bp.user_id = lr.borrower_id
      WHERE lr.status = 'pending'
      ORDER BY lr.created_at DESC`
    );

    // Get available lenders with their capacity
    const [lenderRows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        lp.available_balance,
        lp.total_invested,
        lp.verified
      FROM users u
      INNER JOIN lender_profiles lp ON lp.user_id = u.id
      WHERE u.user_type = 'lender' 
        AND lp.verified = TRUE
        AND lp.available_balance > 0
      ORDER BY lp.available_balance DESC`
    );

    return NextResponse.json({
      pendingLoans: loanRows.map(row => ({
        id: row.id,
        loanNumber: row.loan_number,
        borrowerId: row.borrower_id,
        borrowerName: `${row.first_name} ${row.last_name}`,
        borrowerEmail: row.email,
        amount: Number(row.amount),
        interestRate: Number(row.interest_rate),
        durationMonths: Number(row.duration_months),
        purpose: row.purpose,
        riskGrade: row.risk_grade,
        status: row.status,
        creditScore: row.credit_score,
        employmentStatus: row.employment_status,
        monthlyIncome: Number(row.monthly_income || 0),
        createdAt: row.created_at,
        lendersAssigned: Number(row.lenders_assigned),
      })),
      availableLenders: lenderRows.map(row => ({
        id: row.id,
        name: `${row.first_name} ${row.last_name}`,
        email: row.email,
        availableBalance: Number(row.available_balance),
        totalInvested: Number(row.total_invested),
        verified: Boolean(row.verified),
      })),
    });
  } catch (error) {
    console.error("Admin loan assignments GET error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

// POST: Assign lender(s) to a loan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, loanId, lenderAssignments } = body;

    // lenderAssignments: [{ lenderId: number, amount: number }]

    if (!userId || !loanId || !Array.isArray(lenderAssignments) || lenderAssignments.length === 0) {
      return NextResponse.json(
        { error: "userId, loanId, and lenderAssignments are required" },
        { status: 400 }
      );
    }

    // Verify admin
    const [adminRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, user_type FROM users WHERE id = ? AND user_type = 'admin'`,
      [Number(userId)]
    );

    if (adminRows.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get loan details
    const [loanRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, amount, status, interest_rate, duration_months, borrower_id FROM loan_requests WHERE id = ?`,
      [Number(loanId)]
    );

    if (loanRows.length === 0) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    const loan = loanRows[0];
    const loanAmount = Number(loan.amount);
    const interestRate = Number(loan.interest_rate);
    const durationMonths = Number(loan.duration_months);

    // Validate total assigned amount matches loan amount
    const totalAssigned = lenderAssignments.reduce((sum: number, a: any) => sum + Number(a.amount), 0);
    
    if (Math.abs(totalAssigned - loanAmount) > 0.01) {
      return NextResponse.json(
        { error: `Total assigned amount (P${totalAssigned}) must match loan amount (P${loanAmount})` },
        { status: 400 }
      );
    }

    // Validate each lender has sufficient balance
    for (const assignment of lenderAssignments) {
      const [lenderRows] = await pool.execute<RowDataPacket[]>(
        `SELECT lp.available_balance 
         FROM lender_profiles lp 
         WHERE lp.user_id = ? AND lp.verified = TRUE`,
        [Number(assignment.lenderId)]
      );

      if (lenderRows.length === 0) {
        return NextResponse.json(
          { error: `Lender ${assignment.lenderId} not found or not verified` },
          { status: 400 }
        );
      }

      const availableBalance = Number(lenderRows[0].available_balance);
      const assignedAmount = Number(assignment.amount);

      if (assignedAmount > availableBalance) {
        return NextResponse.json(
          { error: `Lender ${assignment.lenderId} has insufficient balance (P${availableBalance} available, P${assignedAmount} required)` },
          { status: 400 }
        );
      }
    }

    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert lender assignments with amounts and calculate expected returns
      for (const assignment of lenderAssignments) {
        const lenderId = Number(assignment.lenderId);
        const assignedAmount = Number(assignment.amount);
        
        // Calculate interest for this portion
        const interestAmount = (assignedAmount * interestRate * durationMonths) / (100 * 12);
        const totalReturn = assignedAmount + interestAmount;

        // Insert assignment
        await connection.execute(
          `INSERT INTO loan_lender_selections 
           (loan_id, lender_id, amount_lent, interest_amount, total_expected_return, created_at)
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [loanId, lenderId, assignedAmount, interestAmount, totalReturn]
        );

        // Deduct from lender's available balance
        await connection.execute(
          `UPDATE lender_profiles 
           SET available_balance = available_balance - ?,
               total_invested = total_invested + ?
           WHERE user_id = ?`,
          [assignedAmount, assignedAmount, lenderId]
        );
      }

      // Update loan status to 'approved' and mark admin approval
      await connection.execute(
        `UPDATE loan_requests 
         SET status = 'approved', 
             approved_at = NOW()
         WHERE id = ?`,
        [loanId]
      );

      // Create notification for borrower (optional)
      await connection.execute(
        `INSERT INTO notifications (user_id, title, message, type, created_at)
         VALUES (?, ?, ?, 'loan_approved', NOW())`,
        [
          loan.borrower_id,
          'Loan Approved',
          `Your loan application has been approved and lender(s) have been assigned. The funds will be disbursed shortly.`,
        ]
      );

      await connection.commit();
      connection.release();

      return NextResponse.json({
        success: true,
        message: "Lender(s) assigned successfully and loan approved",
        loanId,
        assignmentsCount: lenderAssignments.length,
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Admin loan assignments POST error:", error);
    return NextResponse.json({ error: "Failed to assign lenders" }, { status: 500 });
  }
}
