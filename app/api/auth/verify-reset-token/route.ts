import { NextRequest, NextResponse } from "next/server";
import { PasswordResetService } from "@/lib/passwordResetService";

/**
 * POST /api/auth/verify-reset-token
 * Verify if a password reset token is valid
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Verify the token
    const verification = await PasswordResetService.verifyResetToken(token);

    if (!verification.valid) {
      return NextResponse.json(
        { 
          valid: false,
          error: "Invalid or expired reset token. Please request a new password reset." 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      message: "Token is valid"
    });
  } catch (error) {
    console.error("Verify token error:", error);
    return NextResponse.json(
      { error: "An error occurred while verifying the token" },
      { status: 500 }
    );
  }
}
