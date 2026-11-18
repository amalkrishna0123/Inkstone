import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

const CLOUD_NAME =
  process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  "";
const API_KEY = process.env.CLOUDINARY_API_KEY || "";
const API_SECRET = process.env.CLOUDINARY_API_SECRET || "";

/**
 * DELETE asset from Cloudinary by public_id.
 * Body: { public_id: string; resource_type?: "image" | "video" | "raw" }
 */
export async function POST(request: NextRequest) {
  try {
    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      return NextResponse.json(
        { error: "Cloudinary credentials not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { public_id, resource_type = "image" } = body as {
      public_id: string;
      resource_type?: string;
    };

    if (!public_id) {
      return NextResponse.json({ error: "public_id is required." }, { status: 400 });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = `public_id=${public_id}&timestamp=${timestamp}${API_SECRET}`;
    const signature = crypto.createHash("sha256").update(stringToSign).digest("hex");

    const formData = new FormData();
    formData.append("public_id", public_id);
    formData.append("api_key", API_KEY);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);

    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resource_type}/destroy`;
    const response = await fetch(endpoint, { method: "POST", body: formData });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const msg =
        (err as { error?: { message?: string } })?.error?.message ||
        `Cloudinary delete failed: ${response.status}`;
      return NextResponse.json({ error: msg }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ result: data.result ?? "ok" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Cloudinary delete failed.";
    console.error("[Cloudinary delete error]:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

