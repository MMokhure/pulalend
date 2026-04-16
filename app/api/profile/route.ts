import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdRaw = searchParams.get("userId");

    if (!userIdRaw) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const userId = Number(userIdRaw);
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    const [userRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, email, first_name AS firstName, last_name AS lastName, phone, user_type AS userType,
              status, email_verified AS emailVerified, two_factor_enabled AS twoFactorEnabled
       FROM users
       WHERE id = ?`,
      [userId]
    );

    if (userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userRows[0];

    let profile: any = null;
    if (user.userType === "borrower") {
      const [profileRows] = await pool.execute<RowDataPacket[]>(
        `SELECT business_name AS businessName, business_type AS businessType,
                business_registration_number AS businessRegistrationNumber,
                address, city, country, credit_score AS creditScore, verified
         FROM borrower_profiles
         WHERE user_id = ?
         LIMIT 1`,
        [userId]
      );
      profile = profileRows[0] || null;
    } else if (user.userType === "lender") {
      const [profileRows] = await pool.execute<RowDataPacket[]>(
        `SELECT available_balance AS availableBalance, total_invested AS totalInvested,
                total_earned AS totalEarned, verified
         FROM lender_profiles
         WHERE user_id = ?
         LIMIT 1`,
        [userId]
      );
      profile = profileRows[0] || null;
    }

    return NextResponse.json({ user, profile });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, firstName, lastName, phone, borrowerProfile } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const id = Number(userId);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    // Update base user
    await pool.execute(
      `UPDATE users
       SET first_name = COALESCE(?, first_name),
           last_name = COALESCE(?, last_name),
           phone = COALESCE(?, phone)
       WHERE id = ?`,
      [firstName ?? null, lastName ?? null, phone ?? null, id]
    );

    // Update borrower profile (v1)
    if (borrowerProfile) {
      await pool.execute(
        `UPDATE borrower_profiles
         SET business_name = COALESCE(?, business_name),
             business_type = COALESCE(?, business_type),
             business_registration_number = COALESCE(?, business_registration_number),
             address = COALESCE(?, address),
             city = COALESCE(?, city),
             country = COALESCE(?, country)
         WHERE user_id = ?`,
        [
          borrowerProfile.businessName ?? null,
          borrowerProfile.businessType ?? null,
          borrowerProfile.businessRegistrationNumber ?? null,
          borrowerProfile.address ?? null,
          borrowerProfile.city ?? null,
          borrowerProfile.country ?? null,
          id,
        ]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
