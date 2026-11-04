import crypto from "node:crypto";

const CLOUD_NAME =
  process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  "dgcs4cqfq";
const API_KEY = process.env.CLOUDINARY_API_KEY || "117659188156852";
const API_SECRET = process.env.CLOUDINARY_API_SECRET || "sDHo-cwwCazRYU0eQ9gh2tidaRE";

export type CloudinaryUploadResult = {
  secure_url: string;
  url: string;
  public_id: string;
  format?: string;
  resource_type?: string;
};

/**
 * Uploads a buffer/file to Cloudinary using Cloudinary's signed REST API.
 * Runs server-side only; API secret is never exposed to the client.
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer | Uint8Array,
  folder: string,
  filename?: string,
  mimeType: string = "image/jpeg"
): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    throw new Error("Cloudinary credentials are not configured.");
  }

  const timestamp = Math.floor(Date.now() / 1000);

  // Cloudinary signature requires parameters to be in alphabetical order
  const paramsToSign: Record<string, string> = {
    folder,
    timestamp: String(timestamp),
  };

  const sortedKeys = Object.keys(paramsToSign).sort();
  const serialized = sortedKeys.map((k) => `${k}=${paramsToSign[k]}`).join("&");
  const stringToSign = `${serialized}${API_SECRET}`;

  const signature = crypto.createHash("sha1").update(stringToSign).digest("hex");

  // Build FormData for upload
  const formData = new FormData();
  const blob = new Blob([fileBuffer as any], { type: mimeType });
  formData.append("file", blob, filename || `upload_${Date.now()}`);
  formData.append("api_key", API_KEY);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", folder);
  formData.append("signature", signature);

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    const message =
      (errorJson as { error?: { message?: string } })?.error?.message ||
      `Cloudinary upload failed with status ${response.status}`;
    throw new Error(message);
  }

  const data = (await response.json()) as CloudinaryUploadResult;
  return data;
}

