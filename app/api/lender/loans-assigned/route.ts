import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const lenderId = Number(userId);

    // Get loans assigned to this lender with borrower details
    const [loanRows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        lr.id,
        lr.loan_number,
        lr.amount as total_loan_amount,
        lr.interest_rate,
        lr.duration_months,
        lr.purpose,
        lr.status,
        lr.requested_at,
        lr.approved_at,
        lls.amount_lent,
        lls.interest_amount,
        lls.total_expected_return,
        lls.amount_received,
        lls.status as lender_portion_status,
        u.first_name as borrower_first_name,
        u.last_name as borrower_last_name,
        u.email as borrower_email,
        bp.credit_score
      FROM loan_lender_selections lls
      INNER JOIN loan_requests lr ON lr.id = lls.loan_id
      INNER JOIN users u ON u.id = lr.borrower_id
      LEFT JOIN borrower_profiles bp ON bp.user_id = lr.borrower_id
      WHERE lls.lender_id = ?
      ORDER BY lr.approved_at DESC`,
      [lenderId]
    );

    const loansAssigned = loanRows.map(row => ({
      id: row.id,
      loanNumber: row.loan_number,
      totalLoanAmount: Number(row.total_loan_amount),
      interestRate: Number(row.interest_rate),
      durationMonths: Number(row.duration_months),
      purpose: row.purpose,
      status: row.status,
      createdAt: row.requested_at,
      approvedAt: row.approved_at,
      myPortion: {
        amountLent: Number(row.amount_lent),
        interestAmount: Number(row.interest_amount),
        totalExpectedReturn: Number(row.total_expected_return),
        amountReceived: Number(row.amount_received || 0),
        status: row.lender_portion_status,
        percentageOfLoan: Number(row.total_loan_amount) > 0 
          ? (Number(row.amount_lent) / Number(row.total_loan_amount) * 100).toFixed(2)
          : 0,
      },
      borrower: {
        name: `${row.borrower_first_name} ${row.borrower_last_name}`,
        email: row.borrower_email,
        creditScore: row.credit_score,
      },
    }));

    // Calculate summary statistics
    const summary = {
      totalLoansAssigned: loansAssigned.length,
      totalAmountLent: loansAssigned.reduce((sum, loan) => sum + loan.myPortion.amountLent, 0),
      totalExpectedReturn: loansAssigned.reduce((sum, loan) => sum + loan.myPortion.totalExpectedReturn, 0),
      totalInterestExpected: loansAssigned.reduce((sum, loan) => sum + loan.myPortion.interestAmount, 0),
      totalAmountReceived: loansAssigned.reduce((sum, loan) => sum + loan.myPortion.amountReceived, 0),
      activeLoans: loansAssigned.filter(l => l.status === 'approved' || l.status === 'active').length,
      completedLoans: loansAssigned.filter(l => l.myPortion.status === 'fully_paid').length,
    };

    return NextResponse.json({
      loansAssigned,
      summary,
    });
  } catch (error) {
    console.error("Lender loans assigned GET error:", error);
    return NextResponse.json({ error: "Failed to fetch assigned loans" }, { status: 500 });
  }
}
