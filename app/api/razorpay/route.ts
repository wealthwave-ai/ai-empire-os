import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, phone, email, lead_id } = body as {
    name?: string;
    phone?: string;
    email?: string;
    lead_id?: string;
  };

  if (!phone?.trim()) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }

  // Supabase lead/order storage — optional, skipped if not configured
  let resolvedLeadId = lead_id;
  let resolvedOrderId: string | undefined;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const { createServerClient } = await import("@supabase/ssr");
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: { getAll: () => [], setAll: () => {} },
      });

      if (!resolvedLeadId) {
        const { data: lead, error: leadError } = await supabase
          .from("leads")
          .insert({
            name: name?.trim() ?? null,
            phone: phone.trim(),
            email: email?.trim() ?? null,
            mobile_number: phone.trim(),
            source: "landing_page",
            brand_id: "wealthwave",
            status: "new",
          })
          .select()
          .single();

        if (leadError) {
          console.error("[razorpay] Lead insert error:", leadError.message, leadError.details);
        } else {
          resolvedLeadId = lead.id;
        }
      }

      if (resolvedLeadId) {
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({ lead_id: resolvedLeadId, amount: 999, status: "pending" })
          .select()
          .single();

        if (orderError) {
          console.error("[razorpay] Order insert error:", orderError.message, orderError.details);
        } else {
          resolvedOrderId = order.id;
        }
      }
    } catch (err) {
      console.error("[razorpay] Supabase error:", err);
      // Non-fatal — continue to Razorpay order creation
    }
  } else {
    console.warn("[razorpay] Supabase env vars not configured — skipping lead/order storage");
  }

  // Create Razorpay order (amount in paise)
  try {
    console.log("[razorpay] Creating order — key_id present:", !!process.env.RAZORPAY_KEY_ID, "key_secret present:", !!process.env.RAZORPAY_KEY_SECRET);

    const rzpOrder = await (razorpay.orders.create({
      amount: 99900,
      currency: "INR",
      receipt: resolvedOrderId ?? `ph_${Date.now()}`,
      notes: {
        customer_name: name ?? "",
        customer_phone: phone ?? "",
        lead_id: resolvedLeadId ?? "",
        order_id: resolvedOrderId ?? "",
      },
    }) as unknown as Promise<{ id: string; amount: number; currency: string }>);

    console.log("[razorpay] Order created:", rzpOrder.id);

    return NextResponse.json({
      razorpay_order_id: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      key_id: process.env.RAZORPAY_KEY_ID ?? "",
      lead_id: resolvedLeadId,
      order_id: resolvedOrderId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[razorpay] Razorpay order creation failed:", message, err);
    return NextResponse.json(
      { error: `Razorpay order creation failed: ${message}` },
      { status: 500 }
    );
  }
}
