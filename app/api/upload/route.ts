import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/src/lib/cloudinary";

export const dynamic = "force-dynamic";

/**
 * Cloudinary Media Upload API Route.
 * All media files in the application are uploaded and stored in Cloudinary.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string | null) ?? "uploads";

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadToCloudinary(
      buffer,
      folder,
      file.name,
      file.type || "application/octet-stream"
    );

    return NextResponse.json({
      image_url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Cloudinary upload failed.";
    console.error("[Cloudinary upload error]:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
