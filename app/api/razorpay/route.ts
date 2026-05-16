import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

function getSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

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

  const supabase = getSupabase();

  // Upsert lead if no lead_id provided
  let resolvedLeadId = lead_id;
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
      console.error("[razorpay] Lead create error:", leadError);
      return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
    }
    resolvedLeadId = lead.id;
  }

  // Create a pending order in Supabase
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      lead_id: resolvedLeadId,
      amount: 999,
      status: "pending",
    })
    .select()
    .single();

  if (orderError) {
    console.error("[razorpay] Order create error:", orderError);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }

  // Create Razorpay order (amount in paise)
  let razorpayOrderId: string;
  let razorpayAmount: number;
  let razorpayCurrency: string;
  try {
    // razorpay SDK types are inconsistent — cast through unknown
    const rzpOrder = await (razorpay.orders.create({
      amount: 99900,
      currency: "INR",
      receipt: order.id,
      notes: {
        lead_id: resolvedLeadId ?? "",
        order_id: order.id as string,
        customer_name: name ?? "",
        customer_phone: phone ?? "",
      },
    }) as unknown as Promise<{ id: string; amount: number; currency: string }>);
    razorpayOrderId = rzpOrder.id;
    razorpayAmount   = rzpOrder.amount;
    razorpayCurrency = rzpOrder.currency;
  } catch (err) {
    console.error("[razorpay] Order creation error:", err);
    return NextResponse.json({ error: "Razorpay order creation failed" }, { status: 500 });
  }

  return NextResponse.json({
    razorpay_order_id: razorpayOrderId,
    amount: razorpayAmount,
    currency: razorpayCurrency,
    key_id: process.env.RAZORPAY_KEY_ID ?? "",
    lead_id: resolvedLeadId,
    order_id: order.id,
  });
}
