import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/src/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc, addDoc } from "firebase/firestore";
import { sendOrderConfirmationEmail } from "@/src/lib/email-service";

const RAZORPAY_KEY_SECRET =
  process.env.RAZORPAY_KEY_SECRET || "JvrkG9oyButY0z8RNXiJjIZ0";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await req.json();

    if (!razorpay_payment_id) {
      return NextResponse.json(
        { detail: "Missing razorpay_payment_id." },
        { status: 400 }
      );
    }

    if (RAZORPAY_KEY_SECRET && razorpay_order_id && razorpay_signature) {
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

    let foundOrderId = razorpay_order_id || razorpay_payment_id;
    let expectedDeliveryDate = "";

    try {
      const ordersRef = collection(db, "orders");
      // Search by razorpay_order_id or internal order_id
      let q = query(ordersRef, where("razorpay_order_id", "==", razorpay_order_id || ""));
      let snap = await getDocs(q);

      if (snap.empty && razorpay_order_id) {
        q = query(ordersRef, where("order_id", "==", razorpay_order_id));
        snap = await getDocs(q);
      }

      if (!snap.empty) {
        const orderDoc = snap.docs[0];
        const orderData = orderDoc.data();
        foundOrderId = orderData.order_id || orderDoc.id;

        // Automatically calculate expected delivery date (10 days from order placement)
        const orderDate = orderData.created_at ? new Date(orderData.created_at) : new Date();
        const deliveryDate = new Date(orderDate.getTime() + 10 * 24 * 60 * 60 * 1000);
        expectedDeliveryDate = orderData.expected_delivery_date || deliveryDate.toISOString();

        await updateDoc(doc(db, "orders", orderDoc.id), {
          razorpay_payment_id,
          razorpay_signature: razorpay_signature || "",
          status: "Paid",
          paid_at: new Date().toISOString(),
          expected_delivery_date: expectedDeliveryDate,
        });

        // 1. Send Order Confirmation Email with Expected Delivery Date
        if (orderData.email) {
          try {
            await sendOrderConfirmationEmail({
              order_id: foundOrderId,
              name: orderData.name || "Customer",
              email: orderData.email,
              total: Number(orderData.total || 0),
              payment_method: orderData.payment_method || "Razorpay Online",
              shipping_address: orderData.shipping_address || "",
              items: orderData.items || [],
              expected_delivery_date: expectedDeliveryDate,
              discount_amount: orderData.discount_amount || 0,
              coupon_code: orderData.coupon_code || "",
            });
          } catch (emailErr) {
            console.warn("Order confirmation email sending error:", emailErr);
          }
        }

        // 2. Scratch Card Check: First Successful Order Reward
        try {
          const userEmail = (orderData.email || "").toLowerCase();
          const userId = orderData.user_id;

          let allUserOrdersSnap;
          if (userId) {
            allUserOrdersSnap = await getDocs(query(ordersRef, where("user_id", "==", userId)));
          } else {
            allUserOrdersSnap = await getDocs(query(ordersRef, where("email", "==", userEmail)));
          }

          const paidOrders = allUserOrdersSnap.docs.filter((d) => {
            const st = (d.data().status || "").toLowerCase();
            return st === "paid" || st === "delivered";
          });

          // If this is user's first successful order
          if (paidOrders.length <= 1) {
            const scratchSnap = await getDocs(
              query(collection(db, "scratch_cards"), where("user_email", "==", userEmail))
            );

            if (scratchSnap.empty) {
              const welcomeCode = `WELCOME-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
              const discountPercent = 20;

              // Save Scratch Card
              await addDoc(collection(db, "scratch_cards"), {
                user_id: userId || "",
                user_email: userEmail,
                user_name: orderData.name || "Valued Customer",
                coupon_code: welcomeCode,
                discount_percent: discountPercent,
                min_purchase: 0,
                event_name: "First Order Welcome Reward",
                is_scratched: false,
                created_at: new Date().toISOString(),
              });

              // Add to coupons collection
              await addDoc(collection(db, "coupons"), {
                code: welcomeCode,
                discount_percent: discountPercent,
                min_purchase: 0,
                is_active: true,
                user_email: userEmail,
                is_scratch_card: true,
                event_name: "First Order Welcome Reward",
                created_at: new Date().toISOString(),
              });
            }
          }
        } catch (scratchErr) {
          console.warn("First order scratch card reward error:", scratchErr);
        }
      }
    } catch (dbErr) {
      console.warn("Firestore update warning in verify-payment:", dbErr);
    }

    return NextResponse.json({
      status: "success",
      order_id: foundOrderId,
      expected_delivery_date: expectedDeliveryDate,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { detail: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}

