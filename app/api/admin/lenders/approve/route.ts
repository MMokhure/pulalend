import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

/**
 * POST /api/admin/lenders/approve
 * Approve or reject a lender
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lenderId, action, notes } = body;

    if (!lenderId || !action) {
      return NextResponse.json(
        { error: "lenderId and action are required" },
        { status: 400 }
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    const id = Number(lenderId);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid lenderId" }, { status: 400 });
    }

    // Check if user exists and is a lender
    const [userRows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, email, first_name, last_name, user_type FROM users WHERE id = ? AND user_type = 'lender'",
      [id]
    );

    if (userRows.length === 0) {
      return NextResponse.json(
        { error: "Lender not found" },
        { status: 404 }
      );
    }

    const lender = userRows[0];

    // Check if lender profile exists
    const [profileRows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, verified FROM lender_profiles WHERE user_id = ?",
      [id]
    );

    if (profileRows.length === 0) {
      return NextResponse.json(
        { error: "Lender profile not found" },
        { status: 404 }
      );
    }

    if (action === "approve") {
      // Approve lender
      await pool.execute(
        "UPDATE lender_profiles SET verified = TRUE WHERE user_id = ?",
        [id]
      );

      // Create notification
      await pool.execute(
        "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
        [
          id,
          "Lender Account Approved",
          "Congratulations! Your lender account has been approved. You can now start investing in loans.",
          "success"
        ]
      );

      return NextResponse.json({
        success: true,
        message: "Lender approved successfully",
        lender: {
          id: lender.id,
          email: lender.email,
          firstName: lender.first_name,
          lastName: lender.last_name,
          verified: true
        }
      });
    } else {
      // Reject lender
      await pool.execute(
        "UPDATE lender_profiles SET verified = FALSE WHERE user_id = ?",
        [id]
      );

      // Create notification
      const rejectionMessage = notes 
        ? `Your lender account application has been rejected. Reason: ${notes}`
        : "Your lender account application has been rejected. Please contact support for more information.";

      await pool.execute(
        "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
        [
          id,
          "Lender Account Rejected",
          rejectionMessage,
          "error"
        ]
      );

      return NextResponse.json({
        success: true,
        message: "Lender rejected",
        lender: {
          id: lender.id,
          email: lender.email,
          firstName: lender.first_name,
          lastName: lender.last_name,
          verified: false
        }
      });
    }
  } catch (error) {
    console.error("Lender approve error:", error);
    return NextResponse.json(
      { error: "Failed to process lender approval" },
      { status: 500 }
    );
  }
}
