import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// GET all lenders with their commission rates
export async function GET(request: NextRequest) {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        COALESCE(lp.commission_rate, 2.00) as commission_rate,
        COALESCE(lp.total_invested, 0) as total_invested,
        COALESCE(lp.total_earned, 0) as total_earned
      FROM users u
      LEFT JOIN lender_profiles lp ON u.id = lp.user_id
      WHERE u.user_type = 'lender'
      ORDER BY u.id ASC`
    );

    return NextResponse.json({ lenders: rows });
  } catch (error) {
    console.error("Error fetching lenders:", error);
    return NextResponse.json(
      { error: "Failed to fetch lenders" },
      { status: 500 }
    );
  }
}

// PUT update commission rate for a specific lender
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { lenderId, commissionRate } = body;

    if (!lenderId || commissionRate === undefined || commissionRate === null) {
      return NextResponse.json(
        { error: "lenderId and commissionRate are required" },
        { status: 400 }
      );
    }

    const rate = Number(commissionRate);
    if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
      return NextResponse.json(
        { error: "Commission rate must be between 0 and 100" },
        { status: 400 }
      );
    }

    // Check if lender exists
    const [userRows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, user_type FROM users WHERE id = ?",
      [lenderId]
    );

    if (userRows.length === 0 || userRows[0].user_type !== "lender") {
      return NextResponse.json(
        { error: "Lender not found" },
        { status: 404 }
      );
    }

    // Check if lender_profile exists
    const [profileRows] = await pool.execute<RowDataPacket[]>(
      "SELECT user_id FROM lender_profiles WHERE user_id = ?",
      [lenderId]
    );

    if (profileRows.length === 0) {
      // Create lender profile with the commission rate
      await pool.execute(
        `INSERT INTO lender_profiles (user_id, commission_rate, available_balance, total_invested, total_earned) 
         VALUES (?, ?, 0, 0, 0)`,
        [lenderId, rate]
      );
    } else {
      // Update existing profile
      await pool.execute(
        "UPDATE lender_profiles SET commission_rate = ? WHERE user_id = ?",
        [rate, lenderId]
      );
    }

    return NextResponse.json({
      success: true,
      message: "Commission rate updated successfully",
      lenderId,
      commissionRate: rate,
    });
  } catch (error) {
    console.error("Error updating commission rate:", error);
    return NextResponse.json(
      { error: "Failed to update commission rate" },
      { status: 500 }
    );
  }
}
