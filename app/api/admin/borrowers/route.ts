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

    // Verify admin privileges
    const [adminRows] = await pool.execute<RowDataPacket[]>(
      "SELECT user_type FROM users WHERE id = ?",
      [userId]
    );

    if (adminRows.length === 0 || adminRows[0].user_type !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all borrowers with their profiles and loan statistics
    const [borrowers] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        u.id,
        u.email,
        u.first_name AS firstName,
        u.last_name AS lastName,
        u.phone,
        u.status,
        u.created_at AS createdAt,
        bp.business_name AS businessName,
        bp.business_type AS businessType,
        bp.address,
        bp.city,
        bp.country,
        bp.credit_score AS creditScore,
        bp.verified AS kycVerified,
        bp.monthly_income AS monthlyIncome,
        bp.monthly_debt AS monthlyDebt,
        bp.total_loans AS totalLoans,
        bp.completed_loans AS completedLoans,
        bp.defaulted_loans AS defaultedLoans,
        bp.on_time_payments AS onTimePayments,
        bp.late_payments AS latePayments,
        bp.default_probability AS defaultProbability,
        COUNT(DISTINCT lr.id) AS loanRequestCount,
        COALESCE(SUM(CASE WHEN lr.status = 'active' THEN lr.amount ELSE 0 END), 0) AS activeLoansAmount,
        COALESCE(SUM(CASE WHEN lr.status = 'completed' THEN lr.amount ELSE 0 END), 0) AS completedLoansAmount,
        COALESCE(SUM(CASE WHEN lr.status = 'defaulted' THEN lr.amount ELSE 0 END), 0) AS defaultedLoansAmount,
        COALESCE(SUM(CASE WHEN lr.status = 'pending' THEN lr.amount ELSE 0 END), 0) AS pendingLoansAmount
      FROM users u
      LEFT JOIN borrower_profiles bp ON bp.user_id = u.id
      LEFT JOIN loan_requests lr ON lr.borrower_id = u.id
      WHERE u.user_type = 'borrower'
      GROUP BY u.id, u.email, u.first_name, u.last_name, u.phone, u.status, u.created_at,
               bp.business_name, bp.business_type, bp.address, bp.city, bp.country, bp.credit_score,
               bp.verified, bp.monthly_income, bp.monthly_debt, bp.total_loans, bp.completed_loans,
               bp.defaulted_loans, bp.on_time_payments, bp.late_payments, bp.default_probability
      ORDER BY u.created_at DESC`
    );

    return NextResponse.json({
      borrowers: borrowers.map((b) => ({
        id: b.id,
        email: b.email,
        firstName: b.firstName,
        lastName: b.lastName,
        phone: b.phone,
        status: b.status,
        createdAt: b.createdAt,
        businessName: b.businessName,
        businessType: b.businessType,
        address: b.address,
        city: b.city,
        country: b.country,
        creditScore: b.creditScore ? Number(b.creditScore) : null,
        kycVerified: Boolean(b.kycVerified),
        monthlyIncome: b.monthlyIncome ? Number(b.monthlyIncome) : 0,
        monthlyDebt: b.monthlyDebt ? Number(b.monthlyDebt) : 0,
        totalLoans: b.totalLoans || 0,
        completedLoans: b.completedLoans || 0,
        defaultedLoans: b.defaultedLoans || 0,
        onTimePayments: b.onTimePayments || 0,
        latePayments: b.latePayments || 0,
        defaultProbability: b.defaultProbability ? Number(b.defaultProbability) : null,
        loanRequestCount: b.loanRequestCount || 0,
        activeLoansAmount: Number(b.activeLoansAmount) || 0,
        completedLoansAmount: Number(b.completedLoansAmount) || 0,
        defaultedLoansAmount: Number(b.defaultedLoansAmount) || 0,
        pendingLoansAmount: Number(b.pendingLoansAmount) || 0,
      })),
    });
  } catch (error) {
    console.error("Admin borrowers GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch borrowers" },
      { status: 500 }
    );
  }
}
