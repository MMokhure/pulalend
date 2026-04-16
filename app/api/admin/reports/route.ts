import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get("userId") || "0");
    const period = searchParams.get("period") || "30"; // days

    // Verify admin access
    const [adminRows]: any = await db.query("SELECT * FROM users WHERE id = ? AND user_type = 'admin'", [userId]);
    if (adminRows.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const days = parseInt(period);
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    // Platform Overview
    const [platformStats]: any = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE user_type = 'borrower') as totalBorrowers,
        (SELECT COUNT(*) FROM users WHERE user_type = 'lender') as totalLenders,
        (SELECT COUNT(*) FROM loan_requests) as totalLoans,
        (SELECT COUNT(*) FROM loan_requests WHERE status = 'approved') as approvedLoans,
        (SELECT COUNT(*) FROM loan_requests WHERE status = 'funded') as fundedLoans,
        (SELECT COUNT(*) FROM loan_requests WHERE status = 'completed') as completedLoans,
        (SELECT COALESCE(SUM(amount), 0) FROM loan_requests WHERE status IN ('funded', 'completed')) as totalLoanValue,
        (SELECT COALESCE(SUM(amount), 0) FROM investments) as totalInvestments,
        (SELECT COALESCE(SUM(platform_commission), 0) FROM investments) as totalCommission,
        (SELECT COUNT(*) FROM transactions WHERE created_at >= ?) as recentTransactions,
        (SELECT COUNT(*) FROM users WHERE created_at >= ?) as newUsers
    `, [dateFrom, dateFrom]);

    // Monthly Performance (last 12 months)
    const [monthlyData]: any = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as loanCount,
        COALESCE(SUM(amount), 0) as loanAmount
      FROM loan_requests
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      AND status IN ('approved', 'funded', 'completed')
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month
    `);

    // Investment Performance (last 12 months)
    const [investmentData]: any = await db.query(`
      SELECT 
        DATE_FORMAT(invested_at, '%Y-%m') as month,
        COUNT(*) as investmentCount,
        COALESCE(SUM(amount), 0) as investmentAmount,
        COALESCE(SUM(platform_commission), 0) as commission
      FROM investments
      WHERE invested_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(invested_at, '%Y-%m')
      ORDER BY month
    `);

    // Repayment Performance
    const [repaymentStats]: any = await db.query(`
      SELECT 
        COUNT(*) as totalSchedules,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paidCount,
        SUM(CASE WHEN status = 'pending' AND due_date < NOW() THEN 1 ELSE 0 END) as overdueCount,
        COALESCE(SUM(amount), 0) as expectedAmount,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as paidAmount,
        COALESCE(SUM(CASE WHEN status = 'pending' AND due_date < NOW() THEN amount ELSE 0 END), 0) as overdueAmount
      FROM repayment_schedules
    `);

    const repaymentRate = repaymentStats[0].expectedAmount > 0 
      ? ((repaymentStats[0].paidAmount / repaymentStats[0].expectedAmount) * 100).toFixed(2) 
      : 0;

    // Top Performing Loans
    const [topLoans]: any = await db.query(`
      SELECT 
        lr.id,
        lr.loan_number,
        lr.amount,
        lr.interest_rate,
        lr.status,
        u.name as borrowerName,
        bp.business_name,
        COALESCE(SUM(rs.amount), 0) as totalRepayment,
        COALESCE(SUM(CASE WHEN rs.status = 'paid' THEN rs.amount ELSE 0 END), 0) as paidAmount
      FROM loan_requests lr
      LEFT JOIN users u ON lr.user_id = u.id
      LEFT JOIN borrower_profiles bp ON u.id = bp.user_id
      LEFT JOIN repayment_schedules rs ON lr.id = rs.loan_id
      WHERE lr.status IN ('funded', 'completed')
      GROUP BY lr.id
      ORDER BY paidAmount DESC
      LIMIT 10
    `);

    // Active Issues/Alerts
    const [alerts]: any = await db.query(`
      SELECT 
        'overdue_repayments' as alertType,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as amount
      FROM repayment_schedules
      WHERE status = 'pending' AND due_date < NOW()
      
      UNION ALL
      
      SELECT 
        'pending_kyc' as alertType,
        COUNT(*) as count,
        0 as amount
      FROM kyc_requests
      WHERE status = 'pending'
      
      UNION ALL
      
      SELECT 
        'pending_withdrawals' as alertType,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as amount
      FROM transactions
      WHERE transaction_type = 'withdrawal' AND status = 'pending'
    `);

    // Revenue Breakdown
    const [revenueData]: any = await db.query(`
      SELECT 
        DATE_FORMAT(invested_at, '%Y-%m') as month,
        COALESCE(SUM(platform_commission), 0) as commission,
        COUNT(*) as investmentCount
      FROM investments
      WHERE invested_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(invested_at, '%Y-%m')
      ORDER BY month
    `);

    return NextResponse.json({
      platformStats: platformStats[0],
      monthlyPerformance: monthlyData,
      investmentPerformance: investmentData,
      repaymentMetrics: {
        ...repaymentStats[0],
        repaymentRate: parseFloat(repaymentRate),
      },
      topLoans,
      alerts,
      revenueData,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
