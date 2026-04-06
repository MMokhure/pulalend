import { NextRequest, NextResponse } from "next/server";
import { TwoFactorService } from "@/lib/twoFactorService";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

/**
 * POST /api/auth/2fa/send
 * Send a 2FA code to user's email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user details
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, email, first_name, last_name, two_factor_enabled FROM users WHERE id = ? AND status = 'active'",
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const user = rows[0];

    // Check if 2FA is enabled for this user
    if (!user.two_factor_enabled) {
      return NextResponse.json({
        success: true,
        message: "2FA is disabled for this user",
        twoFactorRequired: false,
      });
    }

    // Generate and send code
    const codeSent = await TwoFactorService.generateAndSendCode(
      user.id,
      user.email,
      user.first_name
    );

    if (!codeSent) {
      return NextResponse.json(
        { error: "Failed to send verification code" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email",
      twoFactorRequired: true,
    });
  } catch (error) {
    console.error("2FA send error:", error);
    return NextResponse.json(
      { error: "An error occurred while sending verification code" },
      { status: 500 }
    );
  }
}
