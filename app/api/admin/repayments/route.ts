import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const statusFilter = searchParams.get("status"); // pending, paid, overdue, partial

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
      statusCondition = "AND rs.status = ?";
      queryParams.push(statusFilter);
    }

    // Fetch all repayment schedules with loan and borrower details
    const [repayments] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        rs.id,
        rs.loan_id AS loanId,
        rs.installment_number AS installmentNumber,
        rs.due_date AS dueDate,
        rs.principal_amount AS principalAmount,
        rs.interest_amount AS interestAmount,
        rs.total_amount AS totalAmount,
        rs.paid_amount AS paidAmount,
        rs.status,
        rs.paid_at AS paidAt,
        rs.created_at AS createdAt,
        lr.loan_number AS loanNumber,
        lr.amount AS loanAmount,
        lr.interest_rate AS interestRate,
        lr.duration_months AS durationMonths,
        lr.status AS loanStatus,
        u.id AS borrowerId,
        u.email AS borrowerEmail,
        u.first_name AS borrowerFirstName,
        u.last_name AS borrowerLastName,
        bp.business_name AS businessName,
        DATEDIFF(CURRENT_DATE, rs.due_date) AS daysOverdue
      FROM repayment_schedules rs
      INNER JOIN loan_requests lr ON lr.id = rs.loan_id
      INNER JOIN users u ON u.id = lr.borrower_id
      LEFT JOIN borrower_profiles bp ON bp.user_id = u.id
      WHERE 1=1 ${statusCondition}
      ORDER BY rs.due_date ASC`,
      queryParams
    );

    // Get summary statistics
    const [summary] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) AS totalRepayments,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paidCount,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pendingCount,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) AS overdueCount,
        SUM(CASE WHEN status = 'partial' THEN 1 ELSE 0 END) AS partialCount,
        SUM(total_amount) AS totalExpected,
        SUM(paid_amount) AS totalPaid,
        SUM(CASE WHEN status IN ('pending', 'overdue', 'partial') THEN (total_amount - paid_amount) ELSE 0 END) AS totalOutstanding,
        SUM(CASE WHEN status = 'overdue' THEN (total_amount - paid_amount) ELSE 0 END) AS overdueAmount
      FROM repayment_schedules rs
      WHERE 1=1 ${statusCondition}`,
      queryParams
    );

    // Get repayments by month
    const [monthlyData] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        DATE_FORMAT(due_date, '%Y-%m') AS month,
        COUNT(*) AS count,
        SUM(total_amount) AS expectedAmount,
        SUM(paid_amount) AS paidAmount,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paidCount
      FROM repayment_schedules rs
      WHERE 1=1 ${statusCondition}
      GROUP BY DATE_FORMAT(due_date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12`,
      queryParams
    );

    return NextResponse.json({
      repayments: repayments.map((r) => ({
        id: r.id,
        loanId: r.loanId,
        loanNumber: r.loanNumber,
        installmentNumber: r.installmentNumber,
        dueDate: r.dueDate,
        principalAmount: Number(r.principalAmount),
        interestAmount: Number(r.interestAmount),
        totalAmount: Number(r.totalAmount),
        paidAmount: Number(r.paidAmount),
        status: r.status,
        paidAt: r.paidAt,
        createdAt: r.createdAt,
        loanAmount: Number(r.loanAmount),
        interestRate: Number(r.interestRate),
        durationMonths: r.durationMonths,
        loanStatus: r.loanStatus,
        borrower: {
          id: r.borrowerId,
          email: r.borrowerEmail,
          name: `${r.borrowerFirstName} ${r.borrowerLastName}`,
          businessName: r.businessName,
        },
        daysOverdue: r.daysOverdue > 0 ? r.daysOverdue : 0,
      })),
      summary: {
        totalRepayments: Number(summary[0].totalRepayments),
        paidCount: Number(summary[0].paidCount),
        pendingCount: Number(summary[0].pendingCount),
        overdueCount: Number(summary[0].overdueCount),
        partialCount: Number(summary[0].partialCount),
        totalExpected: Number(summary[0].totalExpected),
        totalPaid: Number(summary[0].totalPaid),
        totalOutstanding: Number(summary[0].totalOutstanding),
        overdueAmount: Number(summary[0].overdueAmount),
        collectionRate: Number(summary[0].totalExpected) > 0
          ? (Number(summary[0].totalPaid) / Number(summary[0].totalExpected) * 100).toFixed(2)
          : "0.00",
      },
      monthlyData: monthlyData.map((m) => ({
        month: m.month,
        count: Number(m.count),
        expectedAmount: Number(m.expectedAmount),
        paidAmount: Number(m.paidAmount),
        paidCount: Number(m.paidCount),
        collectionRate: Number(m.expectedAmount) > 0
          ? (Number(m.paidAmount) / Number(m.expectedAmount) * 100).toFixed(2)
          : "0.00",
      })),
    });
  } catch (error) {
    console.error("Admin repayments GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch repayments" },
      { status: 500 }
    );
  }
}
