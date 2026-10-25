import { NextResponse } from "next/server";
import { getDatabase } from "../../../src/lib/db";

export async function GET() {
  try {
    const db = await getDatabase();

    await db.command({ ping: 1 });

    return NextResponse.json({
      success: true,
      message: "MongoDB connected successfully",
      database: db.databaseName,
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "MongoDB connection failed",
      },
      { status: 500 }
    );
  }
}