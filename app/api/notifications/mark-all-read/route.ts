import { NextRequest, NextResponse } from "next/server";
import { NotificationService } from "@/lib/notificationService";

/**
 * POST /api/notifications/mark-all-read
 * Mark all notifications as read for a user
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

    const success = await NotificationService.markAllAsRead(userId);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to mark all notifications as read" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    return NextResponse.json(
      { error: "An error occurred while updating notifications" },
      { status: 500 }
    );
  }
}
