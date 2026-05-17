import { NextRequest, NextResponse } from "next/server";

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

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error("[razorpay] Missing credentials — RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set");
    return NextResponse.json({ error: "Razorpay credentials not configured" }, { status: 500 });
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
          console.error("[razorpay] Lead insert error:", leadError.message);
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
          console.error("[razorpay] Order insert error:", orderError.message);
        } else {
          resolvedOrderId = order.id;
        }
      }
    } catch (err) {
      console.error("[razorpay] Supabase error:", err);
    }
  }

  // Create Razorpay order via direct HTTP — no SDK, pure Basic auth
  const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  console.log("[razorpay] Calling orders API — key_id:", keyId.slice(0, 12) + "...");

  const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: 99900,
      currency: "INR",
      receipt: resolvedOrderId ?? `ph_${Date.now()}`,
      notes: {
        customer_name: name ?? "",
        customer_phone: phone ?? "",
        lead_id: resolvedLeadId ?? "",
        order_id: resolvedOrderId ?? "",
      },
    }),
  });

  const rzpData = await rzpRes.json() as {
    id?: string;
    amount?: number;
    currency?: string;
    error?: { code?: string; description?: string };
  };

  if (!rzpRes.ok || rzpData.error) {
    const description = rzpData.error?.description ?? "Unknown error";
    const code = rzpData.error?.code ?? rzpRes.status;
    console.error("[razorpay] API error:", code, description);
    return NextResponse.json(
      { error: `Payment order failed: ${description}` },
      { status: 502 }
    );
  }

  console.log("[razorpay] Order created:", rzpData.id);

  return NextResponse.json({
    razorpay_order_id: rzpData.id,
    amount: rzpData.amount,
    currency: rzpData.currency,
    key_id: keyId,
    lead_id: resolvedLeadId,
    order_id: resolvedOrderId,
  });
}
