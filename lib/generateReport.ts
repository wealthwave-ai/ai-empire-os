import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@supabase/ssr";
import { calculateChaldeanNumber, reduceToSingleDigit } from "./utils";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function getSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

function calcMobileVibration(mobile: string): number {
  const digits = mobile.replace(/\D/g, "");
  const sum = digits.split("").reduce((acc, d) => acc + parseInt(d), 0);
  return reduceToSingleDigit(sum);
}

const REPORT_PROMPT = `You are Rekha Verma Anka, India's leading Chaldean numerology expert. Generate a comprehensive personalised numerology report in Hindi for the following client.

IMPORTANT: Write the ENTIRE report in Hindi (Devanagari script). Be warm, authoritative, and deeply personalised.

CLIENT DATA:
{CLIENT_DATA}

CHALDEAN NUMBERS CALCULATED:
{NUMBERS}

Write the report with these sections (all in Hindi):
1. **प्रिय [नाम]** — व्यक्तिगत अभिवादन (2-3 वाक्य)
2. **आपकी मूल संख्या** — Destiny Number का गहन विश्लेषण (150+ शब्द)
3. **मोबाइल नंबर की वाइब्रेशन** — मोबाइल नंबर का अंकशास्त्रीय प्रभाव (100+ शब्द)
4. **नाम और मोबाइल की संगति** — दोनों संख्याओं की अनुकूलता (80+ शब्द)
5. **धन और करियर मार्गदर्शन** — विशिष्ट सलाह (150+ शब्द)
6. **भाग्यशाली रत्न, रंग और दिन** — विस्तृत सूची और कारण
7. **2025-2026 का पूर्वानुमान** — वार्षिक ऊर्जा और महत्वपूर्ण समय (120+ शब्द)
8. **नाम सुधार की सिफारिश** — यदि आवश्यक हो, तो छोटा सुधार सुझाएं (इससे consultation upsell होती है)
9. **Rekha ji का व्यक्तिगत संदेश** — WhatsApp पर संपर्क करने का निमंत्रण

Minimum 1,000 words. Be specific, not generic. Address the client by first name throughout.`;

export interface ReportParams {
  name: string;
  mobileNumber: string;
  dateOfBirth?: string;
  leadId: string;
  orderId: string;
}

export async function generateNumerologyReport(params: ReportParams): Promise<string> {
  const { name, mobileNumber, dateOfBirth, leadId, orderId } = params;

  const destinyNumber = calculateChaldeanNumber(name);
  const mobileVibration = calcMobileVibration(mobileNumber);
  const compatibility = Math.max(1, 10 - Math.abs(destinyNumber - mobileVibration));

  const clientData = [
    `नाम: ${name}`,
    `मोबाइल नंबर: ${mobileNumber}`,
    dateOfBirth ? `जन्म तिथि: ${dateOfBirth}` : null,
  ].filter(Boolean).join("\n");

  const numbersData = [
    `Destiny Number (नाम से): ${destinyNumber}`,
    `Mobile Vibration Number: ${mobileVibration}`,
    `Name-Mobile Compatibility: ${compatibility}/10`,
  ].join("\n");

  const prompt = REPORT_PROMPT
    .replace("{CLIENT_DATA}", clientData)
    .replace("{NUMBERS}", numbersData);

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-5",
    max_tokens: 8192,
    system: [
      {
        type: "text",
        text: "You are Rekha Verma Anka, India's top Chaldean numerology expert. Generate premium personalised reports in Hindi.",
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: prompt }],
  });

  const message = await stream.finalMessage();
  const reportText = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  // Save report to Supabase orders table
  const supabase = getSupabase();
  await supabase
    .from("orders")
    .update({
      report_url: reportText,
      status: "delivered",
    })
    .eq("id", orderId);

  // Log to agent_logs
  await supabase.from("agent_logs").insert({
    agent_name: "report-agent",
    action: "generate_report",
    result: `Report generated for lead ${leadId} — ${name} — ${destinyNumber} destiny`,
  });

  return reportText;
}
