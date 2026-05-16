import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { generateNumerologyReport } from "@/lib/generateReport";

function getSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

function verifySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = event.event as string;

  if (eventType === "payment.captured") {
    const payload = event.payload as {
      payment: {
        entity: {
          id: string;
          order_id: string;
          amount: number;
          notes: {
            lead_id?: string;
            order_id?: string;
            customer_name?: string;
            customer_phone?: string;
          };
        };
      };
    };

    const payment = payload.payment.entity;
    const { lead_id, order_id, customer_name, customer_phone } = payment.notes;

    if (!lead_id || !order_id) {
      console.error("[webhook] Missing lead_id or order_id in payment notes");
      return NextResponse.json({ error: "Missing notes" }, { status: 400 });
    }

    const supabase = getSupabase();

    // Update order with payment ID and mark as paid
    await supabase
      .from("orders")
      .update({
        razorpay_payment_id: payment.id,
        status: "paid",
      })
      .eq("id", order_id);

    // Update lead status to paid
    await supabase
      .from("leads")
      .update({ status: "paid" })
      .eq("id", lead_id);

    // Log payment event
    await supabase.from("agent_logs").insert({
      agent_name: "system",
      action: "payment_captured",
      result: `Payment ${payment.id} captured for lead ${lead_id} — ₹${payment.amount / 100}`,
    });

    // Trigger report generation asynchronously — don't await so webhook responds fast
    if (customer_name && customer_phone) {
      generateNumerologyReport({
        name: customer_name,
        mobileNumber: customer_phone,
        leadId: lead_id,
        orderId: order_id,
      }).catch((err) => {
        console.error("[webhook] Report generation failed:", err);
      });
    }
  }

  if (eventType === "payment.failed") {
    const payload = event.payload as {
      payment: {
        entity: {
          notes: { lead_id?: string; order_id?: string };
        };
      };
    };
    const { lead_id, order_id } = payload.payment.entity.notes;

    if (lead_id && order_id) {
      const supabase = getSupabase();
      await supabase.from("orders").update({ status: "failed" }).eq("id", order_id);
      await supabase.from("leads").update({ status: "payment_failed" }).eq("id", lead_id);
    }
  }

  return NextResponse.json({ received: true });
}
