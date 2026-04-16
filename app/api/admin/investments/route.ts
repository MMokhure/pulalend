import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const statusFilter = searchParams.get("status"); // active, completed, defaulted

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

    // Build status filter
    let statusCondition = "";
    let queryParams: any[] = [];

    if (statusFilter) {
      statusCondition = "AND inv.status = ?";
      queryParams.push(statusFilter);
    }

    // Fetch all investments with loan, lender, and borrower details
    const [investments] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        inv.id,
        inv.lender_id AS lenderId,
        inv.loan_id AS loanId,
        inv.amount,
        inv.expected_return AS expectedReturn,
        inv.actual_return AS actualReturn,
        inv.platform_commission AS platformCommission,
        inv.status,
        inv.invested_at AS investedAt,
        inv.completed_at AS completedAt,
        lr.loan_number AS loanNumber,
        lr.amount AS loanAmount,
        lr.interest_rate AS interestRate,
        lr.duration_months AS durationMonths,
        lr.status AS loanStatus,
        lender.email AS lenderEmail,
        lender.first_name AS lenderFirstName,
        lender.last_name AS lenderLastName,
        borrower.email AS borrowerEmail,
        borrower.first_name AS borrowerFirstName,
        borrower.last_name AS borrowerLastName,
        bp.business_name AS businessName,
        COALESCE(SUM(rs.paid_amount), 0) AS totalRepaid
      FROM investments inv
      INNER JOIN loan_requests lr ON lr.id = inv.loan_id
      INNER JOIN users lender ON lender.id = inv.lender_id
      INNER JOIN users borrower ON borrower.id = lr.borrower_id
      LEFT JOIN borrower_profiles bp ON bp.user_id = borrower.id
      LEFT JOIN repayment_schedules rs ON rs.loan_id = lr.id
      WHERE 1=1 ${statusCondition}
      GROUP BY inv.id, inv.lender_id, inv.loan_id, inv.amount, inv.expected_return, 
               inv.actual_return, inv.platform_commission, inv.status, inv.invested_at, 
               inv.completed_at, lr.loan_number, lr.amount, lr.interest_rate, lr.duration_months,
               lr.status, lender.email, lender.first_name, lender.last_name, borrower.email,
               borrower.first_name, borrower.last_name, bp.business_name
      ORDER BY inv.invested_at DESC`,
      queryParams
    );

    // Get summary statistics
    const [summary] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) AS totalInvestments,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS activeCount,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completedCount,
        SUM(CASE WHEN status = 'defaulted' THEN 1 ELSE 0 END) AS defaultedCount,
        SUM(amount) AS totalInvested,
        SUM(CASE WHEN status = 'active' THEN amount ELSE 0 END) AS activeAmount,
        SUM(expected_return) AS totalExpectedReturn,
        SUM(actual_return) AS totalActualReturn,
        SUM(platform_commission) AS totalCommission,
        COUNT(DISTINCT lender_id) AS uniqueLenders,
        COUNT(DISTINCT loan_id) AS uniqueLoans
      FROM investments inv
      WHERE 1=1 ${statusCondition}`,
      queryParams
    );

    // Get top lenders
    const [topLenders] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        u.id,
        u.email,
        CONCAT(u.first_name, ' ', u.last_name) AS name,
        COUNT(inv.id) AS investmentCount,
        SUM(inv.amount) AS totalInvested,
        SUM(inv.expected_return) AS totalExpectedReturn,
        SUM(inv.platform_commission) AS totalCommissionPaid
      FROM users u
      INNER JOIN investments inv ON inv.lender_id = u.id
      WHERE u.user_type = 'lender' ${statusCondition.replace('inv.status', 'inv.status')}
      GROUP BY u.id, u.email, u.first_name, u.last_name
      ORDER BY totalInvested DESC
      LIMIT 10`,
      queryParams
    );

    // Get monthly investment trends
    const [monthlyData] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        DATE_FORMAT(invested_at, '%Y-%m') AS month,
        COUNT(*) AS count,
        SUM(amount) AS totalAmount,
        SUM(platform_commission) AS totalCommission,
        COUNT(DISTINCT lender_id) AS uniqueLenders
      FROM investments inv
      WHERE 1=1 ${statusCondition}
      GROUP BY DATE_FORMAT(invested_at, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12`,
      queryParams
    );

    return NextResponse.json({
      investments: investments.map((i) => ({
        id: i.id,
        lenderId: i.lenderId,
        loanId: i.loanId,
        loanNumber: i.loanNumber,
        amount: Number(i.amount),
        expectedReturn: Number(i.expectedReturn),
        actualReturn: Number(i.actualReturn),
        platformCommission: Number(i.platformCommission),
        status: i.status,
        investedAt: i.investedAt,
        completedAt: i.completedAt,
        loanAmount: Number(i.loanAmount),
        interestRate: Number(i.interestRate),
        durationMonths: i.durationMonths,
        loanStatus: i.loanStatus,
        lender: {
          id: i.lenderId,
          email: i.lenderEmail,
          name: `${i.lenderFirstName} ${i.lenderLastName}`,
        },
        borrower: {
          email: i.borrowerEmail,
          name: `${i.borrowerFirstName} ${i.borrowerLastName}`,
          businessName: i.businessName,
        },
        totalRepaid: Number(i.totalRepaid),
      })),
      summary: {
        totalInvestments: Number(summary[0].totalInvestments),
        activeCount: Number(summary[0].activeCount),
        completedCount: Number(summary[0].completedCount),
        defaultedCount: Number(summary[0].defaultedCount),
        totalInvested: Number(summary[0].totalInvested),
        activeAmount: Number(summary[0].activeAmount),
        totalExpectedReturn: Number(summary[0].totalExpectedReturn),
        totalActualReturn: Number(summary[0].totalActualReturn),
        totalCommission: Number(summary[0].totalCommission),
        uniqueLenders: Number(summary[0].uniqueLenders),
        uniqueLoans: Number(summary[0].uniqueLoans),
        averageInvestment: Number(summary[0].totalInvestments) > 0
          ? Number(summary[0].totalInvested) / Number(summary[0].totalInvestments)
          : 0,
      },
      topLenders: topLenders.map((l) => ({
        id: l.id,
        email: l.email,
        name: l.name,
        investmentCount: Number(l.investmentCount),
        totalInvested: Number(l.totalInvested),
        totalExpectedReturn: Number(l.totalExpectedReturn),
        totalCommissionPaid: Number(l.totalCommissionPaid),
      })),
      monthlyData: monthlyData.map((m) => ({
        month: m.month,
        count: Number(m.count),
        totalAmount: Number(m.totalAmount),
        totalCommission: Number(m.totalCommission),
        uniqueLenders: Number(m.uniqueLenders),
      })),
    });
  } catch (error) {
    console.error("Admin investments GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch investments" },
      { status: 500 }
    );
  }
}
