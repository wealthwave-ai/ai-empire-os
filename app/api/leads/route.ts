import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return (cookieStore as unknown as { getAll: () => { name: string; value: string }[] }).getAll();
        },
        setAll() {
          // API routes don't need to set cookies
        },
      },
    }
  );
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, phone, email, source, mobile_number } = body as {
    name?: string;
    phone?: string;
    email?: string;
    source?: string;
    mobile_number?: string;
  };

  if (!phone?.trim()) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("leads")
    .insert({
      name: name?.trim() ?? null,
      phone: phone.trim(),
      email: email?.trim() ?? null,
      mobile_number: mobile_number?.trim() ?? null,
      source: source ?? "landing_page",
      brand_id: "wealthwave",
      status: "new",
    })
    .select()
    .single();

  if (error) {
    console.error("[leads] Supabase insert error:", error);
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
  }

  return NextResponse.json({ success: true, lead: data }, { status: 201 });
}

export async function GET() {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ leads: data });
}
