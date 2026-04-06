import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Platform statistics
    const [userStats] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as totalUsers,
        SUM(CASE WHEN user_type = 'borrower' THEN 1 ELSE 0 END) as totalBorrowers,
        SUM(CASE WHEN user_type = 'lender' THEN 1 ELSE 0 END) as totalLenders,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeUsers,
        SUM(CASE WHEN DATE(created_at) >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as newUsersThisMonth
      FROM users 
      WHERE user_type IN ('borrower', 'lender')`
    );

    const [loanStats] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as totalLoans,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingLoans,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approvedLoans,
        SUM(CASE WHEN status = 'funded' THEN 1 ELSE 0 END) as fundedLoans,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeLoans,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedLoans,
        SUM(CASE WHEN status = 'defaulted' THEN 1 ELSE 0 END) as defaultedLoans,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejectedLoans,
        SUM(amount) as totalVolume,
        SUM(CASE WHEN status IN ('funded', 'active', 'completed') THEN amount ELSE 0 END) as activeLoanVolume
      FROM loan_requests`
    );

    const [investmentStats] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as totalInvestments,
        SUM(amount) as totalInvestedAmount,
        AVG(amount) as avgInvestmentSize,
        SUM(platform_commission) as totalCommissionEarned
      FROM investments`
    );

    const [repaymentStats] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as totalRepayments,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as completedRepayments,
        SUM(CASE WHEN status IN ('pending', 'partial', 'overdue') AND due_date < NOW() THEN 1 ELSE 0 END) as overdueRepayments,
        SUM(COALESCE(paid_amount, 0)) as totalRepaid,
        SUM(CASE WHEN status IN ('pending', 'partial', 'overdue') AND due_date < NOW() THEN (total_amount - COALESCE(paid_amount, 0)) ELSE 0 END) as overdueAmount
      FROM repayment_schedules`
    );

    // KYC statistics
    const [kycStats] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as totalKycSubmissions,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingKyc,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approvedKyc,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejectedKyc
      FROM kyc_requests`
    );

    // Recent activity (last 10 activities)
    const [recentLoans] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        lr.id,
        lr.loan_number,
        lr.amount,
        lr.status,
        lr.requested_at,
        u.first_name,
        u.last_name,
        u.email,
        'loan' as activityType
      FROM loan_requests lr
      INNER JOIN users u ON u.id = lr.borrower_id
      ORDER BY lr.requested_at DESC
      LIMIT 5`
    );

    const [recentInvestments] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        inv.id,
        inv.amount,
        inv.invested_at,
        u.first_name,
        u.last_name,
        lr.loan_number,
        'investment' as activityType
      FROM investments inv
      INNER JOIN users u ON u.id = inv.lender_id
      INNER JOIN loan_requests lr ON lr.id = inv.loan_id
      ORDER BY inv.invested_at DESC
      LIMIT 5`
    );

    const [recentUsers] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        id,
        first_name,
        last_name,
        email,
        user_type,
        created_at,
        'registration' as activityType
      FROM users
      WHERE user_type IN ('borrower', 'lender')
      ORDER BY created_at DESC
      LIMIT 5`
    );

    // Platform health indicators
    const [overdueLoans] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        lr.id,
        lr.loan_number,
        lr.amount,
        lr.status,
        u.first_name,
        u.last_name,
        COUNT(rs.id) as overdueCount
      FROM loan_requests lr
      INNER JOIN users u ON u.id = lr.borrower_id
      INNER JOIN repayment_schedules rs ON rs.loan_id = lr.id
      WHERE rs.status IN ('pending', 'partial', 'overdue') 
        AND rs.due_date < NOW()
        AND lr.status = 'active'
      GROUP BY lr.id
      HAVING overdueCount > 0
      ORDER BY overdueCount DESC
      LIMIT 5`
    );

    // Calculate platform metrics
    const userStat = userStats[0];
    const loanStat = loanStats[0];
    const investmentStat = investmentStats[0];
    const repaymentStat = repaymentStats[0];
    const kycStat = kycStats[0];

    const approvalRate = loanStat.totalLoans > 0 
      ? ((Number(loanStat.approvedLoans) + Number(loanStat.fundedLoans) + Number(loanStat.activeLoans) + Number(loanStat.completedLoans)) / Number(loanStat.totalLoans) * 100).toFixed(1)
      : '0.0';

    const defaultRate = (Number(loanStat.fundedLoans) + Number(loanStat.activeLoans) + Number(loanStat.completedLoans) + Number(loanStat.defaultedLoans)) > 0
      ? (Number(loanStat.defaultedLoans) / (Number(loanStat.fundedLoans) + Number(loanStat.activeLoans) + Number(loanStat.completedLoans) + Number(loanStat.defaultedLoans)) * 100).toFixed(1)
      : '0.0';

    const repaymentRate = repaymentStat.totalRepayments > 0
      ? (Number(repaymentStat.completedRepayments) / Number(repaymentStat.totalRepayments) * 100).toFixed(1)
      : '0.0';

    // Combine recent activities
    const activities = [
      ...recentLoans.map(l => ({
        type: 'loan',
        id: l.id,
        title: `New Loan Request #${l.loan_number || l.id}`,
        description: `${l.first_name} ${l.last_name} requested P${Number(l.amount).toLocaleString()}`,
        status: l.status,
        timestamp: l.requested_at,
      })),
      ...recentInvestments.map(i => ({
        type: 'investment',
        id: i.id,
        title: `New Investment in #${i.loan_number || i.id}`,
        description: `${i.first_name} ${i.last_name} invested P${Number(i.amount).toLocaleString()}`,
        status: 'completed',
        timestamp: i.invested_at,
      })),
      ...recentUsers.map(u => ({
        type: 'registration',
        id: u.id,
        title: `New ${u.user_type} registered`,
        description: `${u.first_name} ${u.last_name} (${u.email})`,
        status: 'active',
        timestamp: u.created_at,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

    return NextResponse.json({
      stats: {
        users: {
          total: Number(userStat.totalUsers),
          borrowers: Number(userStat.totalBorrowers),
          lenders: Number(userStat.totalLenders),
          active: Number(userStat.activeUsers),
          newThisMonth: Number(userStat.newUsersThisMonth),
        },
        loans: {
          total: Number(loanStat.totalLoans),
          pending: Number(loanStat.pendingLoans),
          approved: Number(loanStat.approvedLoans),
          funded: Number(loanStat.fundedLoans),
          active: Number(loanStat.activeLoans),
          completed: Number(loanStat.completedLoans),
          defaulted: Number(loanStat.defaultedLoans),
          rejected: Number(loanStat.rejectedLoans),
          totalVolume: Number(loanStat.totalVolume),
          activeLoanVolume: Number(loanStat.activeLoanVolume),
        },
        investments: {
          total: Number(investmentStat.totalInvestments),
          totalAmount: Number(investmentStat.totalInvestedAmount),
          avgSize: Number(investmentStat.avgInvestmentSize),
          totalCommissionEarned: Number(investmentStat.totalCommissionEarned),
        },
        repayments: {
          total: Number(repaymentStat.totalRepayments),
          completed: Number(repaymentStat.completedRepayments),
          overdue: Number(repaymentStat.overdueRepayments),
          totalRepaid: Number(repaymentStat.totalRepaid),
          overdueAmount: Number(repaymentStat.overdueAmount),
        },
        kyc: {
          total: Number(kycStat.totalKycSubmissions),
          pending: Number(kycStat.pendingKyc),
          approved: Number(kycStat.approvedKyc),
          rejected: Number(kycStat.rejectedKyc),
        },
        metrics: {
          approvalRate,
          defaultRate,
          repaymentRate,
        },
      },
      activities,
      overdueLoans: overdueLoans.map(l => ({
        id: l.id,
        loanNumber: l.loan_number,
        borrower: `${l.first_name} ${l.last_name}`,
        amount: Number(l.amount),
        status: l.status,
        overdueCount: Number(l.overdueCount),
      })),
    });
  } catch (error) {
    console.error("Admin dashboard GET error:", error);
    return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 });
  }
}
