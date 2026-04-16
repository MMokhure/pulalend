import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get("userId") || "0");
    const typeFilter = searchParams.get("type") || "";
    const userIdFilter = searchParams.get("userId_filter") || "";

    // Verify admin access
    const [adminRows]: any = await db.query("SELECT * FROM users WHERE id = ? AND user_type = 'admin'", [userId]);
    if (adminRows.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Build query
    let query = `
      SELECT 
        n.*,
        u.name as userName,
        u.email as userEmail,
        u.user_type as userType
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (typeFilter) {
      query += " AND n.type = ?";
      params.push(typeFilter);
    }

    if (userIdFilter) {
      query += " AND n.user_id = ?";
      params.push(parseInt(userIdFilter));
    }

    query += " ORDER BY n.created_at DESC LIMIT 500";

    const [notifications]: any = await db.query(query, params);

    // Calculate summary
    const summary = {
      total: notifications.length,
      unread: notifications.filter((n: any) => !n.is_read).length,
      read: notifications.filter((n: any) => n.is_read).length,
      byType: {} as Record<string, number>,
    };

    notifications.forEach((n: any) => {
      summary.byType[n.type] = (summary.byType[n.type] || 0) + 1;
    });

    // Get type counts
    const typeCounts = Object.entries(summary.byType).map(([type, count]) => ({
      type,
      count,
    }));

    return NextResponse.json({
      notifications,
      summary,
      typeCounts,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, notificationIds, action } = body;

    // Verify admin access
    const [adminRows]: any = await db.query("SELECT * FROM users WHERE id = ? AND user_type = 'admin'", [userId]);
    if (adminRows.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (action === "mark_read" && notificationIds && notificationIds.length > 0) {
      const placeholders = notificationIds.map(() => "?").join(",");
      await db.query(`UPDATE notifications SET is_read = 1 WHERE id IN (${placeholders})`, notificationIds);
      return NextResponse.json({ success: true, message: "Notifications marked as read" });
    }

    if (action === "delete" && notificationIds && notificationIds.length > 0) {
      const placeholders = notificationIds.map(() => "?").join(",");
      await db.query(`DELETE FROM notifications WHERE id IN (${placeholders})`, notificationIds);
      return NextResponse.json({ success: true, message: "Notifications deleted" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}
