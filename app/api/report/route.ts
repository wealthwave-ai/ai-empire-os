import { NextRequest, NextResponse } from "next/server";
import { generateNumerologyReport } from "@/lib/generateReport";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, mobile_number, date_of_birth, lead_id, order_id } = body as {
    name?: string;
    mobile_number?: string;
    date_of_birth?: string;
    lead_id?: string;
    order_id?: string;
  };

  if (!name?.trim() || !mobile_number?.trim()) {
    return NextResponse.json(
      { error: "name and mobile_number are required" },
      { status: 400 }
    );
  }

  if (!lead_id || !order_id) {
    return NextResponse.json(
      { error: "lead_id and order_id are required" },
      { status: 400 }
    );
  }

  try {
    const report = await generateNumerologyReport({
      name: name.trim(),
      mobileNumber: mobile_number.trim(),
      dateOfBirth: date_of_birth,
      leadId: lead_id,
      orderId: order_id,
    });

    return NextResponse.json({ success: true, report });
  } catch (err) {
    console.error("[report] Generation error:", err);
    return NextResponse.json(
      { error: "Report generation failed", details: String(err) },
      { status: 500 }
    );
  }
}
