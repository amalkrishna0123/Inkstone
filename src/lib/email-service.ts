import nodemailer from "nodemailer";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Setup Nodemailer transporter with environment variables or fallback
function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER || "";
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS || "";

  if (user && pass) {
    console.log(`[Email Service] Using real SMTP transport — host: ${host}, port: ${port}, user: ${user}`);
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });
  }

  // No SMTP credentials — log a clear warning so it's obvious in server logs
  console.warn(
    "[Email Service] ⚠️  NO SMTP credentials found in environment variables.\n" +
    "  → Set SMTP_USER and SMTP_PASS in .env.local to send real emails.\n" +
    "  → Falling back to jsonTransport (emails will NOT be delivered)."
  );
  return nodemailer.createTransport({
    jsonTransport: true,
  });
}

const FROM_EMAIL = process.env.SMTP_FROM || '"InkStone Crystals" <orders@inkstonecrystals.com>';

export type OrderConfirmationEmailData = {
  order_id: string;
  name: string;
  email: string;
  total: number;
  payment_method: string;
  shipping_address: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  expected_delivery_date: string;
  discount_amount?: number;
  coupon_code?: string;
};

export type PromotionalEmailData = {
  to: string;
  customer_name?: string;
  subject: string;
  title: string;
  message: string;
  coupon_code?: string;
  discount_percent?: number;
  banner_url?: string;
  cta_url?: string;
};

/**
 * Sends an Order Confirmation email with the automatically calculated 10-day expected delivery date.
 */
export async function sendOrderConfirmationEmail(data: OrderConfirmationEmailData) {
  const transporter = getTransporter();
  const deliveryDateFormatted = new Date(data.expected_delivery_date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const itemsHtml = (data.items || [])
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 12px 8px; font-weight: 600; color: #1a1a1a;">${item.name}</td>
        <td style="padding: 12px 8px; text-align: center; color: #666;">${item.quantity}</td>
        <td style="padding: 12px 8px; text-align: right; font-weight: 700; color: #1a1a1a;">Rs. ${(item.price * item.quantity).toLocaleString("en-IN")}</td>
      </tr>
    `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order Confirmed</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f7f7f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f5; padding: 40px 15px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.06);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #0d0f0c; padding: 36px 30px; text-align: center;">
                    <div style="display: inline-block; background-color: #ffea00; color: #000; font-weight: 900; font-size: 20px; width: 42px; height: 42px; line-height: 42px; border-radius: 10px; margin-bottom: 10px;">C</div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">INKSTONE CRYSTALS</h1>
                    <p style="color: #ffea00; margin: 6px 0 0 0; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">Order Confirmed & Payment Verified</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 35px 30px;">
                    <h2 style="font-size: 22px; font-weight: 800; color: #111111; margin-top: 0; margin-bottom: 8px;">Thank you for your order, ${data.name}!</h2>
                    <p style="color: #555555; font-size: 14px; line-height: 1.6; margin: 0 0 25px 0;">
                      We've received your order <strong>#${data.order_id}</strong>. Our artisans are carefully preparing and inspecting your selected crystal pieces.
                    </p>

                    <!-- Prominent Expected Delivery Date Box -->
                    <div style="background: linear-gradient(135deg, #fffde6 0%, #fff7a8 100%); border: 2px solid #ffea00; padding: 22px 20px; border-radius: 16px; margin: 25px 0; text-align: center;">
                      <p style="margin: 0; font-size: 12px; font-weight: 800; color: #6b6000; text-transform: uppercase; letter-spacing: 1.5px;">Expected Delivery Date</p>
                      <h3 style="margin: 6px 0 4px 0; font-size: 24px; font-weight: 900; color: #111111;">${deliveryDateFormatted}</h3>
                      <p style="margin: 0; font-size: 12px; color: #6b6000; font-weight: 500;">
                        Standard 10-day insured express courier delivery
                      </p>
                    </div>

                    <!-- Items Table -->
                    <h3 style="font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #222222; margin-bottom: 12px; border-bottom: 2px solid #111; padding-bottom: 8px;">Order Details</h3>
                    <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; margin-bottom: 20px;">
                      <thead>
                        <tr style="background-color: #f7f7f5; text-transform: uppercase; font-size: 11px; font-weight: 800; color: #555;">
                          <th style="padding: 10px 8px; text-align: left;">Item</th>
                          <th style="padding: 10px 8px; text-align: center;">Qty</th>
                          <th style="padding: 10px 8px; text-align: right;">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                    </table>

                    <!-- Price summary -->
                    <table width="100%" cellpadding="4" cellspacing="0" style="font-size: 13px; color: #555; margin-bottom: 25px;">
                      ${
                        data.discount_amount && data.discount_amount > 0
                          ? `<tr>
                              <td align="right" style="padding: 4px 0;">Discount (${data.coupon_code || "Coupon"}):</td>
                              <td align="right" width="100" style="color: #059669; font-weight: 700;">-Rs. ${data.discount_amount.toLocaleString("en-IN")}</td>
                            </tr>`
                          : ""
                      }
                      <tr>
                        <td align="right" style="padding: 4px 0;">Shipping:</td>
                        <td align="right" width="100" style="color: #059669; font-weight: 700;">FREE</td>
                      </tr>
                      <tr style="border-top: 2px solid #eee;">
                        <td align="right" style="padding: 10px 0; font-size: 16px; font-weight: 900; color: #111;">Total Paid:</td>
                        <td align="right" width="100" style="padding: 10px 0; font-size: 18px; font-weight: 900; color: #111;">Rs. ${data.total.toLocaleString("en-IN")}</td>
                      </tr>
                    </table>

                    <!-- Delivery info -->
                    <div style="background-color: #fbfbf9; border-radius: 12px; padding: 18px; margin-bottom: 25px; border: 1px solid #eeeeee;">
                      <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #888;">Delivery Address</p>
                      <p style="margin: 0; font-size: 13px; color: #333; line-height: 1.5;">${data.shipping_address || "Default Shipping Address"}</p>
                    </div>

                    <!-- CTA -->
                    <div style="text-align: center; margin-top: 30px;">
                      <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard/orders" style="display: inline-block; background-color: #111111; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 800; font-size: 13px; letter-spacing: 0.5px;">View Order in Dashboard</a>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f7f7f5; padding: 25px 30px; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="margin: 0; font-size: 12px; color: #888888;">
                      Have questions about your order? Reach out anytime at <a href="mailto:support@inkstonecrystals.com" style="color: #111; font-weight: 600;">support@inkstonecrystals.com</a>.
                    </p>
                    <p style="margin: 8px 0 0 0; font-size: 11px; color: #aaaaaa;">
                      © ${new Date().getFullYear()} InkStone Crystals. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: data.email,
      subject: `Order Confirmed: #${data.order_id} (Expected Delivery: ${deliveryDateFormatted})`,
      html,
    });

    // Check if we're running in jsonTransport fallback (no real send happened)
    const isJsonTransport = typeof (info as any)?.envelope === "undefined" && typeof (info as any)?.message === "string";
    const deliveryStatus = isJsonTransport ? "not_sent_no_smtp" : "delivered";

    // Save record to Firestore sent_emails collection
    await addDoc(collection(db, "sent_emails"), {
      recipient: data.email,
      recipient_name: data.name,
      subject: `Order Confirmed: #${data.order_id}`,
      type: "order_confirmation",
      order_id: data.order_id,
      expected_delivery_date: data.expected_delivery_date,
      total: data.total,
      sent_at: new Date().toISOString(),
      status: deliveryStatus,
      createdAtTimestamp: serverTimestamp(),
    });

    if (isJsonTransport) {
      console.warn("[Email Service] ⚠️  Order confirmation email was NOT sent — no SMTP credentials configured.");
      return { success: false, error: "No SMTP credentials — email not delivered." };
    }

    return { success: true, messageId: (info as any)?.messageId || "sent_ok" };
  } catch (err: any) {
    console.warn("[Email Service] Order confirmation send warning:", err.message);
    // Still record to sent_emails collection so it reflects in the dashboard audit log
    try {
      await addDoc(collection(db, "sent_emails"), {
        recipient: data.email,
        recipient_name: data.name,
        subject: `Order Confirmed: #${data.order_id}`,
        type: "order_confirmation",
        order_id: data.order_id,
        expected_delivery_date: data.expected_delivery_date,
        total: data.total,
        sent_at: new Date().toISOString(),
        status: "logged",
        error: err.message,
        createdAtTimestamp: serverTimestamp(),
      });
    } catch { /* ignore */ }
    return { success: false, error: err.message };
  }
}

/**
 * Sends a Marketing / Promotional email to an individual customer or broadcast.
 */
export async function sendPromotionalEmail(data: PromotionalEmailData) {
  const transporter = getTransporter();

  const couponSection = data.coupon_code
    ? `
      <div style="background: linear-gradient(135deg, #0d0f0c 0%, #1a1f14 100%); border-radius: 16px; padding: 24px 20px; margin: 25px 0; text-align: center; border: 2px dashed #ffea00;">
        <span style="display: inline-block; background-color: #ffea00; color: #000; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 50px; text-transform: uppercase; margin-bottom: 8px;">Exclusive Gift Offer</span>
        <h3 style="color: #ffffff; margin: 4px 0 2px 0; font-size: 26px; font-weight: 900; letter-spacing: 1px;">${data.discount_percent ? `${data.discount_percent}% OFF` : "SPECIAL DISCOUNT"}</h3>
        <p style="color: #cfcfcf; font-size: 13px; margin: 0 0 15px 0;">Use coupon code at checkout:</p>
        <div style="display: inline-block; background: #ffffff; color: #000000; font-family: monospace; font-size: 20px; font-weight: 800; padding: 10px 24px; border-radius: 10px; letter-spacing: 3px;">
          ${data.coupon_code}
        </div>
      </div>
    `
    : "";

  const bannerSection = data.banner_url
    ? `
      <div style="margin: 20px 0; border-radius: 14px; overflow: hidden;">
        <img src="${data.banner_url}" alt="Promotion" style="width: 100%; max-height: 240px; object-fit: cover; display: block;" />
      </div>
    `
    : "";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${data.subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f7f7f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f5; padding: 40px 15px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.06);">
                <tr>
                  <td style="background-color: #0d0f0c; padding: 32px 30px; text-align: center;">
                    <div style="display: inline-block; background-color: #ffea00; color: #000; font-weight: 900; font-size: 20px; width: 42px; height: 42px; line-height: 42px; border-radius: 10px; margin-bottom: 8px;">C</div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">INKSTONE CRYSTALS</h1>
                    <p style="color: #ffea00; margin: 4px 0 0 0; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">Special Announcement</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 35px 30px;">
                    ${bannerSection}
                    <h2 style="font-size: 22px; font-weight: 800; color: #111111; margin-top: 0; margin-bottom: 12px;">${data.title || data.subject}</h2>
                    ${data.customer_name ? `<p style="font-size: 14px; color: #666; margin: 0 0 15px 0;">Hello ${data.customer_name},</p>` : ""}
                    <div style="font-size: 14px; color: #444444; line-height: 1.7; white-space: pre-line; margin-bottom: 25px;">
                      ${data.message}
                    </div>

                    ${couponSection}

                    <div style="text-align: center; margin-top: 30px;">
                      <a href="${data.cta_url || (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000") + "/product"}" style="display: inline-block; background-color: #111111; color: #ffffff; text-decoration: none; padding: 14px 34px; border-radius: 50px; font-weight: 800; font-size: 13px; letter-spacing: 0.5px;">Explore Collection</a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f7f7f5; padding: 25px 30px; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="margin: 0; font-size: 11px; color: #888888;">
                      You received this email because you are a registered customer of InkStone Crystals.
                    </p>
                    <p style="margin: 8px 0 0 0; font-size: 11px; color: #aaaaaa;">
                      © ${new Date().getFullYear()} InkStone Crystals. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: data.to,
      subject: data.subject,
      html,
    });

    // Check if we're running in jsonTransport fallback (no real send happened)
    const isJsonTransport = typeof (info as any)?.envelope === "undefined" && typeof (info as any)?.message === "string";
    const deliveryStatus = isJsonTransport ? "not_sent_no_smtp" : "delivered";

    await addDoc(collection(db, "sent_emails"), {
      recipient: data.to,
      recipient_name: data.customer_name || "",
      subject: data.subject,
      type: "marketing",
      coupon_code: data.coupon_code || null,
      sent_at: new Date().toISOString(),
      status: deliveryStatus,
      createdAtTimestamp: serverTimestamp(),
    });

    if (isJsonTransport) {
      console.warn("[Email Service] ⚠️  Promotional email was NOT sent — no SMTP credentials configured.");
      return { success: false, error: "No SMTP credentials — email not delivered." };
    }

    return { success: true, messageId: (info as any)?.messageId || "sent_ok" };
  } catch (err: any) {
    console.warn("[Email Service] Promotional send warning:", err.message);
    try {
      await addDoc(collection(db, "sent_emails"), {
        recipient: data.to,
        recipient_name: data.customer_name || "",
        subject: data.subject,
        type: "marketing",
        coupon_code: data.coupon_code || null,
        sent_at: new Date().toISOString(),
        status: "logged",
        error: err.message,
        createdAtTimestamp: serverTimestamp(),
      });
    } catch { /* ignore */ }
    return { success: false, error: err.message };
  }
}

