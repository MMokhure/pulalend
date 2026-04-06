import { NextRequest, NextResponse } from "next/server";
import { NotificationService } from "@/lib/notificationService";

/**
 * GET /api/notifications
 * Get notifications for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const userIdNum = parseInt(userId);

    let notifications;
    if (unreadOnly) {
      notifications = await NotificationService.getUnread(userIdNum, limit);
    } else {
      notifications = await NotificationService.getAll(userIdNum, limit, offset);
    }

    const unreadCount = await NotificationService.getUnreadCount(userIdNum);

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
      total: notifications.length,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching notifications" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Create a new notification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, message, type, actionUrl, actionLabel } = body;

    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: "User ID, title, and message are required" },
        { status: 400 }
      );
    }

    const success = await NotificationService.create(
      userId,
      title,
      message,
      type || 'info',
      actionUrl,
      actionLabel
    );

    if (!success) {
      return NextResponse.json(
        { error: "Failed to create notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification created successfully",
    });
  } catch (error) {
    console.error("Create notification error:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the notification" },
      { status: 500 }
    );
  }
}
