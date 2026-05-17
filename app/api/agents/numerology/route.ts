import { NextRequest, NextResponse } from "next/server";
import {
  generateNumerologyReport,
  calculateMobileNumerology,
  type NumerologyInput,
} from "@/lib/agents/numerology-agent";

async function logToSupabase(
  input: NumerologyInput,
  numbers: ReturnType<typeof calculateMobileNumerology>
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) return;

  try {
    const { createServerClient } = await import("@supabase/ssr");
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: { getAll: () => [], setAll: () => {} },
    });

    await supabase.from("agent_logs").insert({
      action_type: "report_generated",
      customer_mobile: numbers.normalizedMobile,
      language: input.language,
      destiny_number: numbers.destinyNumber,
      report_version: "v1.0",
      performance_score: null,
      timestamp: new Date().toISOString(),
      notes: input.name ? `Customer name: ${input.name}` : null,
    });
  } catch (err) {
    // Non-fatal — log but don't block the response
    console.error("[numerology] Supabase log error:", err);
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { mobile, language, name } = body as {
    mobile?: string;
    language?: string;
    name?: string;
  };

  // Validate mobile
  const cleanMobile = mobile?.replace(/[^0-9]/g, "") ?? "";
  const normalizedMobile =
    cleanMobile.length === 12 && cleanMobile.startsWith("91")
      ? cleanMobile.slice(2)
      : cleanMobile.slice(-10);

  if (normalizedMobile.length !== 10) {
    return NextResponse.json(
      { error: "Valid 10-digit mobile number required" },
      { status: 400 }
    );
  }

  const lang = language === "english" ? "english" : "hindi";

  const input: NumerologyInput = {
    mobile: normalizedMobile,
    language: lang,
    name: name?.trim() || undefined,
  };

  // Calculate numbers for logging (non-blocking)
  const numbers = calculateMobileNumerology(normalizedMobile);
  logToSupabase(input, numbers).catch(() => {});

  const stream = generateNumerologyReport(input);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store",
      Connection: "keep-alive",
      "X-Agent": "ceo-numerology",
      "X-Destiny-Number": String(numbers.destinyNumber),
    },
  });
}
