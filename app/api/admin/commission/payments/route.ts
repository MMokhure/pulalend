import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { getSessionUser } from "@/lib/auth";

/**
 * GET /api/admin/commission/payments
 * Get all commission payments with summary
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    // Verify admin user
    const user = await getSessionUser(request, userId ? parseInt(userId) : undefined);
    if (!user || user.user_type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all commission payments
    const [payments] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        cp.*,
        u.first_name,
        u.last_name,
        u.email
      FROM commission_payments cp
      LEFT JOIN users u ON cp.processed_by = u.id
      ORDER BY cp.payment_date DESC, cp.created_at DESC`
    );

    // Get total commission earned from investments
    const [earnedResult] = await pool.execute<RowDataPacket[]>(
      `SELECT COALESCE(SUM(platform_commission), 0) as total_earned
      FROM investments`
    );

    // Get total commission paid out
    const [paidResult] = await pool.execute<RowDataPacket[]>(
      `SELECT COALESCE(SUM(amount), 0) as total_paid
      FROM commission_payments
      WHERE status = 'completed'`
    );

    const totalEarned = Number(earnedResult[0]?.total_earned || 0);
    const totalPaid = Number(paidResult[0]?.total_paid || 0);
    const availableBalance = totalEarned - totalPaid;

    return NextResponse.json({
      payments,
      summary: {
        totalEarned,
        totalPaid,
        availableBalance,
        paymentCount: payments.length
      }
    });
  } catch (error: any) {
    console.error("Error fetching commission payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch commission payments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/commission/payments
 * Record a new commission payment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      amount, 
      paymentMethod, 
      paymentReference, 
      recipientDetails, 
      notes, 
      paymentDate,
      userId 
    } = body;

    // Verify admin user
    const user = await getSessionUser(request, userId);
    if (!user || user.user_type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
    }

    if (!paymentMethod) {
      return NextResponse.json({ error: "Payment method is required" }, { status: 400 });
    }

    if (!paymentDate) {
      return NextResponse.json({ error: "Payment date is required" }, { status: 400 });
    }

    // Check available balance
    const [earnedResult] = await pool.execute<RowDataPacket[]>(
      `SELECT COALESCE(SUM(platform_commission), 0) as total_earned
      FROM investments`
    );

    const [paidResult] = await pool.execute<RowDataPacket[]>(
      `SELECT COALESCE(SUM(amount), 0) as total_paid
      FROM commission_payments
      WHERE status = 'completed'`
    );

    const totalEarned = Number(earnedResult[0]?.total_earned || 0);
    const totalPaid = Number(paidResult[0]?.total_paid || 0);
    const availableBalance = totalEarned - totalPaid;

    if (amount > availableBalance) {
      return NextResponse.json(
        { error: `Insufficient balance. Available: P${availableBalance.toFixed(2)}` },
        { status: 400 }
      );
    }

    // Insert commission payment
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO commission_payments 
      (amount, payment_method, payment_reference, recipient_details, notes, processed_by, payment_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'completed')`,
      [
        amount,
        paymentMethod,
        paymentReference || null,
        recipientDetails || null,
        notes || null,
        user.id,
        paymentDate
      ]
    );

    return NextResponse.json({
      success: true,
      paymentId: result.insertId,
      message: "Commission payment recorded successfully"
    });
  } catch (error: any) {
    console.error("Error recording commission payment:", error);
    return NextResponse.json(
      { error: "Failed to record commission payment" },
      { status: 500 }
    );
  }
}
