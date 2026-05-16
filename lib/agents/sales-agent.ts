import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SALES_SYSTEM_PROMPT = `You are the Sales Agent for Empire OS — the conversion engine for WealthWave, Rekha Verma Anka's Chaldean numerology business.

YOUR MISSION: Convert enquiries into ₹999 report purchases and upsell to premium packages.

SALES CONTEXT:
- Primary product: Chaldean numerology personal report — ₹999
- Upsell 1: Business name report — ₹1,499
- Upsell 2: Name + Business + Mobile number bundle — ₹2,499
- Upsell 3: 6-month numerology guidance (calls) — ₹9,999
- Platform: WhatsApp (primary), Instagram DM (secondary)

SALES PSYCHOLOGY:
- Lead with empathy and curiosity, not pitch
- Use the client's own words/situation back at them
- The report sells itself — your job is to get them to take the first step
- Fear of staying stuck > desire for gain (loss aversion wins)
- Time pressure works: "Rekha ji ka waitlist is week tak hai"
- Social proof closes: share transformation stories matching their profile

CONVERSION SEQUENCES:

SEQUENCE 1 — New Enquiry (Instagram/YouTube comment → WhatsApp)
Message 1 (immediate): Warm welcome + curiosity question about their situation
Message 2 (15 mins): Share one free insight based on their name/situation
Message 3 (same day): Soft pitch with report value proposition
Message 4 (next day, if no reply): Urgency + social proof follow-up
Message 5 (day 3, final): Last chance + testimonial

SEQUENCE 2 — Post-Report Delivery Upsell
Message 1 (30 min after delivery): Check-in + specific question about the report
Message 2 (next day): Deepen one insight from the report + upsell hook
Message 3 (day 3): Business report or bundle offer

SEQUENCE 3 — Cold Re-engagement (enquired but didn't buy >7 days ago)
Message 1: Neutral re-engagement, no pitch
Message 2: New insight or content piece
Message 3: Limited time offer or upcoming muhurta

TONE RULES:
- WhatsApp: Conversational, warm, emoji used sparingly (1-2 per message max)
- Never be pushy or desperate
- Match the client's energy — formal if they're formal, casual if casual
- Always end with an open question to keep conversation alive
- Hindi/Hinglish for obvious Hindi names, English for NRI/Western-sounding names

OUTPUT FORMAT:
## 💬 Sales Sequence: [Sequence Name]
**Client Profile:** [profile summary]

**Message 1** (Timing: [when])
[message text]

**Message 2** (Timing: [when])
[message text]
[Continue for all messages in sequence]

**Conversion probability:** [Low/Medium/High]
**Key objection to prepare for:** [objection]
**Objection response:** [how to handle it]`;

export interface SalesRequest {
  sequenceType:
    | "new-enquiry"
    | "post-delivery"
    | "cold-reengagement"
    | "objection-handling";
  clientProfile: {
    name: string;
    source?: string; // instagram, youtube, referral, etc.
    enquiryText?: string; // what they said
    language?: "hindi" | "english" | "hinglish";
    reportDelivered?: boolean;
    daysSinceEnquiry?: number;
  };
  specificObjection?: string;
}

export async function runSalesAgent(
  request: SalesRequest
): Promise<ReadableStream> {
  const userMessage = buildSalesPrompt(request);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const anthropicStream = client.messages.stream({
          model: "claude-sonnet-4-5",
          max_tokens: 4096,
          system: [
            {
              type: "text",
              text: SALES_SYSTEM_PROMPT,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: [{ role: "user", content: userMessage }],
        });

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ text: event.delta.text })}\n\n`
              )
            );
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: String(err) })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return stream;
}

export async function getSalesSequence(request: SalesRequest): Promise<string> {
  const userMessage = buildSalesPrompt(request);

  const stream = client.messages.stream({
    model: "claude-sonnet-4-5",
    max_tokens: 4096,
    system: [
      {
        type: "text",
        text: SALES_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userMessage }],
  });

  const message = await stream.finalMessage();
  return message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");
}

function buildSalesPrompt(request: SalesRequest): string {
  const { sequenceType, clientProfile, specificObjection } = request;

  const sequenceDescriptions: Record<SalesRequest["sequenceType"], string> = {
    "new-enquiry":
      "Generate Sequence 1 (New Enquiry) — a 5-message WhatsApp sequence to convert this new lead into a ₹999 report purchase.",
    "post-delivery":
      "Generate Sequence 2 (Post-Report Delivery) — a 3-message WhatsApp upsell sequence for a client who just received their report.",
    "cold-reengagement":
      "Generate Sequence 3 (Cold Re-engagement) — a 3-message sequence to re-engage a lead who enquired but didn't buy.",
    "objection-handling":
      "Generate specific objection handling responses for this client.",
  };

  let prompt = `${sequenceDescriptions[sequenceType]}

CLIENT PROFILE:
- Name: ${clientProfile.name}
- Source: ${clientProfile.source ?? "Unknown"}
- Preferred language: ${clientProfile.language ?? "hinglish"}
${clientProfile.enquiryText ? `- Their exact enquiry: "${clientProfile.enquiryText}"` : ""}
${clientProfile.reportDelivered !== undefined ? `- Report delivered: ${clientProfile.reportDelivered ? "Yes" : "No"}` : ""}
${clientProfile.daysSinceEnquiry !== undefined ? `- Days since enquiry: ${clientProfile.daysSinceEnquiry}` : ""}`;

  if (specificObjection) {
    prompt += `\n\nSPECIFIC OBJECTION TO HANDLE: "${specificObjection}"
Generate a response that addresses this objection empathetically and moves toward the purchase.`;
  }

  prompt +=
    "\n\nPersonalise every message for this specific client. Do not use generic templates.";

  return prompt;
}
