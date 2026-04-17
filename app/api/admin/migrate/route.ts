import { NextResponse } from "next/server";
import { runMigrations } from "@/lib/runMigrations";

export async function POST() {
  try {
    const { applied, errors } = await runMigrations();
    return NextResponse.json({
      message: applied.length > 0 ? "Migrations applied successfully" : "All migrations already up to date",
      applied,
      errors,
    });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Migration failed: " + error.message },
      { status: 500 }
    );
  }
}
