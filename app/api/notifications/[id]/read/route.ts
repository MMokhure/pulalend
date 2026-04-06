import { NextRequest, NextResponse } from "next/server";
import { NotificationService } from "@/lib/notificationService";

/**
 * PATCH /api/notifications/[id]/read
 * Mark a notification as read
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { userId } = body;
    const notificationId = parseInt(params.id);

    if (!userId || isNaN(notificationId)) {
      return NextResponse.json(
        { error: "User ID and valid notification ID are required" },
        { status: 400 }
      );
    }

    const success = await NotificationService.markAsRead(notificationId, userId);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to mark notification as read" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the notification" },
      { status: 500 }
    );
  }
}
