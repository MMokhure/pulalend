import { NextRequest, NextResponse } from "next/server";
import { TwoFactorService } from "@/lib/twoFactorService";

/**
 * POST /api/auth/2fa/verify
 * Verify a 2FA code
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, code } = body;

    if (!userId || !code) {
      return NextResponse.json(
        { error: "User ID and code are required" },
        { status: 400 }
      );
    }

    // Verify the code
    const isValid = await TwoFactorService.verifyCode(userId, code);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Code verified successfully",
    });
  } catch (error) {
    console.error("2FA verification error:", error);
    return NextResponse.json(
      { error: "An error occurred during verification" },
      { status: 500 }
    );
  }
}
