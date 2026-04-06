import { NextRequest, NextResponse } from "next/server";
import { NotificationService } from "@/lib/notificationService";

/**
 * DELETE /api/notifications/[id]
 * Delete a notification
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const notificationId = parseInt(params.id);

    if (!userId || isNaN(notificationId)) {
      return NextResponse.json(
        { error: "User ID and valid notification ID are required" },
        { status: 400 }
      );
    }

    const success = await NotificationService.delete(notificationId, parseInt(userId));

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the notification" },
      { status: 500 }
    );
  }
}
