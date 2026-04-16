import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { getSessionUser } from "@/lib/auth";

/**
 * GET /api/lender/commission-rate
 * Get lender's commission rate and earnings breakdown
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    // Verify lender user
    const user = await getSessionUser(request, userId ? parseInt(userId) : undefined);
    if (!user || user.user_type !== "lender") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get lender's commission rate and stats
    const [profileResult] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        commission_rate,
        total_invested,
        total_earned
      FROM lender_profiles
      WHERE user_id = ?`,
      [user.id]
    );

    if (profileResult.length === 0) {
      return NextResponse.json({
        commissionRate: 2.0,
        totalInvested: 0,
        totalEarned: 0,
        totalCommission: 0
      });
    }

    const profile = profileResult[0];
    const commissionRate = Number(profile.commission_rate || 2.0);
    const totalInvested = Number(profile.total_invested || 0);
    const totalEarned = Number(profile.total_earned || 0);

    // Get total commission paid
    const [commissionResult] = await pool.execute<RowDataPacket[]>(
      `SELECT COALESCE(SUM(platform_commission), 0) as total_commission
      FROM investments
      WHERE lender_id = ?`,
      [user.id]
    );

    const totalCommission = Number(commissionResult[0]?.total_commission || 0);

    return NextResponse.json({
      commissionRate,
      totalInvested,
      totalEarned,
      totalCommission
    });
  } catch (error: any) {
    console.error("Error fetching commission rate:", error);
    return NextResponse.json(
      { error: "Failed to fetch commission rate" },
      { status: 500 }
    );
  }
}
