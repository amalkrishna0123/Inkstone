import { NextResponse } from "next/server";
import {
  sendOrderConfirmationEmail,
  sendPromotionalEmail,
  OrderConfirmationEmailData,
  PromotionalEmailData,
} from "@/src/lib/email-service";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "order_confirmation") {
      const emailData = body.data as OrderConfirmationEmailData;
      if (!emailData?.email || !emailData?.order_id) {
        return NextResponse.json({ detail: "Missing required order email fields." }, { status: 400 });
      }
      const result = await sendOrderConfirmationEmail(emailData);
      return NextResponse.json(result);
    }

    if (action === "promotional") {
      const emailData = body.data as PromotionalEmailData;
      if (!emailData?.to || !emailData?.subject || !emailData?.message) {
        return NextResponse.json({ detail: "Missing required promotional email fields." }, { status: 400 });
      }
      const result = await sendPromotionalEmail(emailData);
      return NextResponse.json(result);
    }

    if (action === "batch_promotional") {
      const { recipients, ...commonData } = body.data;
      if (!Array.isArray(recipients) || recipients.length === 0) {
        return NextResponse.json({ detail: "Missing recipients array for batch promotional email." }, { status: 400 });
      }
      if (!commonData?.subject || !commonData?.message) {
        return NextResponse.json({ detail: "Missing subject or message for batch promotional email." }, { status: 400 });
      }

      const results = await Promise.allSettled(
        recipients.map((recipient: { email: string; name?: string }) =>
          sendPromotionalEmail({
            ...commonData,
            to: recipient.email,
            customer_name: recipient.name || "",
          })
        )
      );

      const successful = results.filter((r) => r.status === "fulfilled" && (r.value as any)?.success).length;
      return NextResponse.json({
        success: true,
        total: recipients.length,
        sent: successful,
        failed: recipients.length - successful,
      });
    }

    return NextResponse.json({ detail: "Unknown email action." }, { status: 400 });
  } catch (error: any) {
    console.error("API send-email error:", error);
    return NextResponse.json({ detail: error.message || "Email sending failed." }, { status: 500 });
  }
}

