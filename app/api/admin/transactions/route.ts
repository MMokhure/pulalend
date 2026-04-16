import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type"); // filter by transaction type
    const status = searchParams.get("status"); // filter by status
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

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

    // Build query with filters
    let whereConditions = [];
    let queryParams: any[] = [];

    if (type) {
      whereConditions.push("t.transaction_type = ?");
      queryParams.push(type);
    }

    if (status) {
      whereConditions.push("t.status = ?");
      queryParams.push(status);
    }

    if (startDate) {
      whereConditions.push("DATE(t.created_at) >= ?");
      queryParams.push(startDate);
    }

    if (endDate) {
      whereConditions.push("DATE(t.created_at) <= ?");
      queryParams.push(endDate);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(" AND ")}` 
      : "";

    // Fetch all transactions with user details
    const [transactions] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        t.id,
        t.user_id AS userId,
        t.transaction_type AS transactionType,
        t.amount,
        t.reference_id AS referenceId,
        t.reference_type AS referenceType,
        t.description,
        t.status,
        t.created_at AS createdAt,
        u.email,
        u.first_name AS firstName,
        u.last_name AS lastName,
        u.user_type AS userType
      FROM transactions t
      INNER JOIN users u ON u.id = t.user_id
      ${whereClause}
      ORDER BY t.created_at DESC`,
      queryParams
    );

    // Get summary statistics
    const [summary] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) AS totalTransactions,
        SUM(CASE WHEN transaction_type = 'deposit' THEN amount ELSE 0 END) AS totalDeposits,
        SUM(CASE WHEN transaction_type = 'withdrawal' THEN amount ELSE 0 END) AS totalWithdrawals,
        SUM(CASE WHEN transaction_type = 'investment' THEN amount ELSE 0 END) AS totalInvestments,
        SUM(CASE WHEN transaction_type = 'repayment' THEN amount ELSE 0 END) AS totalRepayments,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) AS completedAmount,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS pendingAmount,
        SUM(CASE WHEN status = 'failed' THEN amount ELSE 0 END) AS failedAmount
      FROM transactions t
      ${whereClause}`,
      queryParams
    );

    // Get transaction counts by type
    const [typeCounts] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        transaction_type AS type,
        COUNT(*) AS count,
        SUM(amount) AS totalAmount
      FROM transactions t
      ${whereClause}
      GROUP BY transaction_type`,
      queryParams
    );

    return NextResponse.json({
      transactions: transactions.map((t) => ({
        id: t.id,
        userId: t.userId,
        email: t.email,
        userName: `${t.firstName} ${t.lastName}`,
        userType: t.userType,
        transactionType: t.transactionType,
        amount: Number(t.amount),
        referenceId: t.referenceId,
        referenceType: t.referenceType,
        description: t.description,
        status: t.status,
        createdAt: t.createdAt,
      })),
      summary: {
        totalTransactions: Number(summary[0].totalTransactions),
        totalDeposits: Number(summary[0].totalDeposits),
        totalWithdrawals: Number(summary[0].totalWithdrawals),
        totalInvestments: Number(summary[0].totalInvestments),
        totalRepayments: Number(summary[0].totalRepayments),
        completedAmount: Number(summary[0].completedAmount),
        pendingAmount: Number(summary[0].pendingAmount),
        failedAmount: Number(summary[0].failedAmount),
      },
      typeCounts: typeCounts.map((tc) => ({
        type: tc.type,
        count: Number(tc.count),
        totalAmount: Number(tc.totalAmount),
      })),
    });
  } catch (error) {
    console.error("Admin transactions GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
