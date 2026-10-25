import { NextResponse } from "next/server";
import { getDatabase } from "../../../src/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json(
      {
        success: false,
        message: "MONGODB_URI is not defined in environment variables.",
      },
      { status: 503 }
    );
  }

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