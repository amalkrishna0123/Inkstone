import { NextResponse } from "next/server";
import { db } from "@/src/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const RAZORPAY_KEY_ID =
  process.env.RAZORPAY_KEY_ID ||
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
  "rzp_test_TT5aIG5SUGgmA2";
const RAZORPAY_KEY_SECRET =
  process.env.RAZORPAY_KEY_SECRET || "JvrkG9oyButY0z8RNXiJjIZ0";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const totalINR = parseFloat(data.total || 0);
    const amountPaise = Math.round(totalINR * 100);

    if (amountPaise < 100) {
      return NextResponse.json(
        { detail: "Order amount must be at least ₹1 (100 paise)." },
        { status: 400 }
      );
    }

    const orderId = `CR-${Math.random().toString(16).substring(2, 8).toUpperCase()}`;
    let rzOrderId = "";

    // Create real order in Razorpay
    if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
      try {
        const authHeader =
          "Basic " +
          Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");

        const rzRes = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify({
            amount: amountPaise,
            currency: "INR",
            receipt: orderId,
            payment_capture: 1,
          }),
        });

        if (rzRes.ok) {
          const rzData = await rzRes.json();
          rzOrderId = rzData.id || "";
        } else {
          const errData = await rzRes.text();
          console.warn("Razorpay API order creation error:", rzRes.status, errData);
        }
      } catch (rzErr: any) {
        console.warn("Razorpay order creation network warning:", rzErr.message);
      }
    }

    const now = new Date();
    const deliveryDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
    const expectedDeliveryDateISO = deliveryDate.toISOString();

    const orderDoc = {
      order_id: orderId,
      name: data.name || "",
      email: (data.email || "").toLowerCase(),
      total: totalINR,
      status: "Pending",
      payment_method: data.payment_method || "Razorpay",
      shipping_address: data.shipping_address || "",
      items: data.items || [],
      attachment_url: data.attachment_url || "",
      coupon_code: data.coupon_code || "",
      discount_amount: parseFloat(data.discount_amount || 0),
      razorpay_order_id: rzOrderId,
      razorpay_payment_id: "",
      razorpay_signature: "",
      created_at: now.toISOString(),
      expected_delivery_date: expectedDeliveryDateISO,
      user_id: data.user_id || null,
    };

    let docId = orderId;
    try {
      const docRef = await addDoc(collection(db, "orders"), {
        ...orderDoc,
        createdAtTimestamp: serverTimestamp(),
      });
      docId = docRef.id;
    } catch (dbErr) {
      console.warn("Firestore save warning in route handler:", dbErr);
    }

    return NextResponse.json(
      {
        id: docId,
        ...orderDoc,
        razorpay_order_id: rzOrderId,
        amount: amountPaise,
        currency: "INR",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Orders API error:", error);
    return NextResponse.json({ detail: error.message || "Failed to create order" }, { status: 500 });
  }
}

