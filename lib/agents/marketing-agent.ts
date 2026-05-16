import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MARKETING_SYSTEM_PROMPT = `You are the Marketing Agent for Empire OS — the content engine for WealthWave, Rekha Verma Anka's Chaldean numerology brand.

YOUR MISSION: Generate 3 high-converting video scripts daily that drive enquiries to WhatsApp and ₹999 report sales.

BRAND VOICE:
- Authoritative but warm — Rekha is a trusted elder, not a salesperson
- Mix Hindi and English naturally (Hinglish) — urban India connects with this
- Use fear-of-missing-out and fear-of-wrong-name as primary conversion levers
- Social proof heavy: reference transformations, real results, specific outcomes
- Never make specific income guarantees — speak to "energy alignment" and "removing blocks"

CONTENT FORMATS TO PRODUCE:
1. Instagram Reels Script (60-90 seconds, hook in first 3 seconds)
2. YouTube Shorts Script (under 60 seconds, strong CTA)
3. WhatsApp Status Copy (short, punchy, with emoji — drives DMs)

HOOK ARCHETYPES THAT CONVERT:
- Fear: "Kya aapka naam aapki wealth rok raha hai?" (Is your name blocking your wealth?)
- Curiosity: "Ek letter change kiya, ₹3 lakh zyada aayi" (Changed one letter, ₹3L extra income)
- Identity: "8 number waale log kaise bante hain crorepati?"
- Social proof: "Is client ka business 3 mahine mein 4x ho gaya — sirf naam correction se"
- Urgency: "Aaj se ek week baad numerology ka cycle badlega"

SCRIPT STRUCTURE (for Reels):
1. Hook (0-3s): Bold fear/curiosity statement
2. Problem (3-15s): Identify the pain (money not growing, luck poor, opportunities missed)
3. Insight (15-45s): Numerology explanation, Rekha's expertise, one example
4. Proof (45-65s): Transformation story or testimonial reference
5. CTA (65-90s): "Link in bio mein jaao, WhatsApp pe message karo — ₹999 mein apni ank report paao"

OUTPUT FORMAT:
## 📱 Content Package — [Date]

### Script 1: Instagram Reel
**Hook:** [first 3 seconds text]
**Full Script:** [complete voiceover text]
**On-screen text overlays:** [bullet list]
**Hashtags:** [15 hashtags]

### Script 2: YouTube Short
**Hook:** [first 3 seconds]
**Full Script:** [complete script]
**CTA:** [end card text]

### Script 3: WhatsApp Status
**Copy:** [3 status messages with emoji]

Always produce exactly 3 scripts per request.`;

export interface MarketingRequest {
  topic?: string;
  hooks?: string[];
  targetNumber?: number; // Chaldean number to focus on (1-9)
  format?: "reels" | "shorts" | "whatsapp" | "all";
  urgencyAngle?: string;
}

export async function runMarketingAgent(
  request: MarketingRequest
): Promise<ReadableStream> {
  const userMessage = buildMarketingPrompt(request);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const anthropicStream = client.messages.stream({
          model: "claude-sonnet-4-5",
          max_tokens: 6144,
          system: [
            {
              type: "text",
              text: MARKETING_SYSTEM_PROMPT,
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

export async function getMarketingScripts(
  request: MarketingRequest
): Promise<string> {
  const userMessage = buildMarketingPrompt(request);

  const stream = client.messages.stream({
    model: "claude-sonnet-4-5",
    max_tokens: 6144,
    system: [
      {
        type: "text",
        text: MARKETING_SYSTEM_PROMPT,
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

function buildMarketingPrompt(request: MarketingRequest): string {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const parts: string[] = [`Generate today's (${today}) content package.`];

  if (request.topic) {
    parts.push(`\nContent topic/theme: ${request.topic}`);
  } else {
    parts.push(
      "\nChoose the most impactful numerology topic for today — focus on wealth, name correction, or destiny number."
    );
  }

  if (request.targetNumber) {
    parts.push(
      `\nFocus on Chaldean number ${request.targetNumber} — use its specific energy and traits.`
    );
  }

  if (request.hooks && request.hooks.length > 0) {
    parts.push(`\nUse these hooks as inspiration:\n${request.hooks.join("\n")}`);
  }

  if (request.urgencyAngle) {
    parts.push(`\nUrgency angle to weave in: ${request.urgencyAngle}`);
  }

  const formatInstruction =
    request.format === "reels"
      ? "Focus on Instagram Reels scripts (produce 3 variations)."
      : request.format === "shorts"
        ? "Focus on YouTube Shorts scripts (produce 3 variations)."
        : request.format === "whatsapp"
          ? "Focus on WhatsApp Status copy (produce 9 short status messages)."
          : "Produce the full content package: 1 Reels script + 1 YouTube Short + 3 WhatsApp statuses.";

  parts.push(`\nFormat: ${formatInstruction}`);
  parts.push(
    "\nEvery script must drive traffic to WhatsApp and the ₹999 report purchase."
  );

  return parts.join("");
}
