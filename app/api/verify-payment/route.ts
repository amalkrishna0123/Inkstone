import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/src/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ detail: "Missing payment verification fields." }, { status: 400 });
    }

    if (RAZORPAY_KEY_SECRET) {
      const generatedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return NextResponse.json(
          { detail: "Payment signature verification failed." },
          { status: 400 }
        );
      }
    }

    let foundOrderId = razorpay_order_id;
    try {
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, where("razorpay_order_id", "==", razorpay_order_id));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const orderDoc = snap.docs[0];
        foundOrderId = orderDoc.data().order_id || orderDoc.id;
        await updateDoc(doc(db, "orders", orderDoc.id), {
          razorpay_payment_id,
          razorpay_signature,
          status: "Paid",
          paid_at: new Date().toISOString(),
        });
      }
    } catch (dbErr) {
      console.warn("Firestore update warning in verify-payment:", dbErr);
    }

    return NextResponse.json({ status: "success", order_id: foundOrderId });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { detail: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}

