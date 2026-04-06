import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyPassword } from "@/lib/auth";
import { TwoFactorService } from "@/lib/twoFactorService";
import { RowDataPacket } from "mysql2";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, twoFactorCode } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Get user from database
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ? AND status = 'active'",
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const user = rows[0];

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if 2FA is enabled for this user
    const twoFactorEnabled = user.two_factor_enabled === 1;

    // If 2FA is enabled and no code provided, send code and require verification
    if (twoFactorEnabled && !twoFactorCode) {
      // Generate and send 2FA code
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
        requiresTwoFactor: true,
        userId: user.id,
        message: "Verification code sent to your email",
      });
    }

    // If 2FA is enabled and code is provided, verify it
    if (twoFactorEnabled && twoFactorCode) {
      const codeValid = await TwoFactorService.verifyCode(user.id, twoFactorCode);
      
      if (!codeValid) {
        return NextResponse.json(
          { error: "Invalid or expired verification code" },
          { status: 401 }
        );
      }
    }

    // Return user data (without password)
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      userType: user.user_type,
      status: user.status,
      emailVerified: user.email_verified,
      twoFactorEnabled: twoFactorEnabled,
    };

    return NextResponse.json({
      success: true,
      user: userData,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
