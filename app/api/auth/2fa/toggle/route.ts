import { NextRequest, NextResponse } from "next/server";
import { TwoFactorService } from "@/lib/twoFactorService";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

/**
 * POST /api/auth/2fa/toggle
 * Enable or disable 2FA for a user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, enabled } = body;

    if (!userId || typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: "User ID and enabled status are required" },
        { status: 400 }
      );
    }

    // Verify user exists
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Toggle 2FA
    const success = await TwoFactorService.toggle2FA(userId, enabled);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update 2FA settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `2FA ${enabled ? 'enabled' : 'disabled'} successfully`,
      twoFactorEnabled: enabled,
    });
  } catch (error) {
    console.error("2FA toggle error:", error);
    return NextResponse.json(
      { error: "An error occurred while updating 2FA settings" },
      { status: 500 }
    );
  }
}
