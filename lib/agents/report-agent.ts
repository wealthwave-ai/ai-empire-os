import Anthropic from "@anthropic-ai/sdk";
import { calculateChaldeanNumber, reduceToSingleDigit } from "../utils";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const REPORT_SYSTEM_PROMPT = `You are the Report Agent for Empire OS — the delivery engine for WealthWave by Rekha Verma Anka. You generate personalised Chaldean numerology reports in English.

YOUR MISSION: Produce a premium, personalised Chaldean numerology report worth every rupee of ₹999. Each report must feel like Rekha personally wrote it — insightful, warm, and specific to the client.

CHALDEAN NUMEROLOGY SYSTEM:
Letter-to-number mapping:
A=1, B=2, C=3, D=4, E=5, F=8, G=3, H=5, I=1
J=1, K=2, L=3, M=4, N=5, O=7, P=8, Q=1, R=2
S=3, T=4, U=6, V=6, W=6, X=5, Y=1, Z=7

NUMBERS TO CALCULATE:
1. Destiny Number (full birth name)
2. Soul Number (vowels only)
3. Personality Number (consonants only)
4. Mobile Number Vibration (all digits reduced)
5. Name Compound Number (before reducing — the hidden vibration)
6. Name-Mobile Compatibility Score (1-10)

NUMBER MEANINGS (for personalisation):
1 — Leadership, independence, pioneer energy, Sun
2 — Harmony, intuition, Moon energy, partnerships
3 — Creativity, expression, Jupiter's abundance
4 — Stability, hard work, Rahu's karmic lessons
5 — Change, communication, Mercury's adaptability
6 — Love, beauty, Venus, home and family
7 — Spirituality, wisdom, Ketu's intuition
8 — Power, wealth, Saturn's discipline and reward
9 — Humanity, completion, Mars' courage

WEALTH NUMBERS: 8 (primary), 6, 3, 1
CHALLENGE NUMBERS: 4 (delays), 7 (isolation), 2 (overdependence)
MASTER NUMBERS: 11 (spiritual leader), 22 (master builder), 33 (master teacher)

REPORT SECTIONS (must include all):
1. Executive Summary (2-3 sentences — the most important insight)
2. Destiny Number Analysis (birth name vibration)
3. Soul Number — Inner Desire (what the soul craves)
4. Personality Number — How the World Sees You
5. Mobile Number Vibration (money and opportunity energy)
6. Name-Mobile Compatibility Analysis
7. Current Numerology Year Analysis (based on birth date)
8. Wealth & Career Guidance (specific, actionable)
9. Relationship Energy
10. Name Correction Recommendation (if needed — creates upsell opportunity)
11. Lucky Numbers, Colours, Days, and Gemstones
12. Closing Message from Rekha

TONE:
- Professional, warm, and personal — like a trusted advisor
- Specific and concrete, not vague ("Your 8 energy means you are built for wealth accumulation through structured discipline" not "You have good energy")
- Validate their struggles before offering hope
- The name correction section should always suggest a small change that could help — this drives consultation upsells
- End with an invitation to reach out to Rekha for deeper guidance

LENGTH: Minimum 1,200 words. Maximum 2,000 words. This is a premium product.`;

export interface ClientDetails {
  fullName: string;
  dateOfBirth: string; // DD/MM/YYYY
  mobileNumber: string; // 10-digit Indian mobile
  additionalContext?: string; // any extra info from client
}

interface NumerologyData {
  destinyNumber: number;
  soulNumber: number;
  personalityNumber: number;
  mobileVibration: number;
  compoundNumber: number;
  personalYear: number;
  nameCompatibilityScore: number;
}

function computeNumerologyData(client: ClientDetails): NumerologyData {
  const name = client.fullName;
  const vowels = "aeiouAEIOU";
  const consonants = name
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .split("")
    .filter((c) => !"aeiou".includes(c));
  const vowelChars = name
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .split("")
    .filter((c) => "aeiou".includes(c));

  const chaldeanMap: Record<string, number> = {
    a: 1, b: 2, c: 3, d: 4, e: 5, f: 8, g: 3, h: 5, i: 1,
    j: 1, k: 2, l: 3, m: 4, n: 5, o: 7, p: 8, q: 1, r: 2,
    s: 3, t: 4, u: 6, v: 6, w: 6, x: 5, y: 1, z: 7,
  };

  const nameSum = name
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .split("")
    .reduce((acc, c) => acc + (chaldeanMap[c] ?? 0), 0);

  const soulSum = vowelChars.reduce(
    (acc, c) => acc + (chaldeanMap[c] ?? 0),
    0
  );
  const personalitySum = consonants.reduce(
    (acc, c) => acc + (chaldeanMap[c] ?? 0),
    0
  );

  const mobileDigits = client.mobileNumber.replace(/[^0-9]/g, "");
  const mobileSum = mobileDigits
    .split("")
    .reduce((acc, d) => acc + parseInt(d), 0);

  const [day, month, year] = client.dateOfBirth.split("/").map(Number);
  const currentYear = new Date().getFullYear();
  const personalYearSum = day + month + currentYear;

  const diff = Math.abs(
    reduceToSingleDigit(nameSum) - reduceToSingleDigit(mobileSum)
  );
  const compatibility = Math.max(1, 10 - diff);

  return {
    destinyNumber: calculateChaldeanNumber(name),
    soulNumber: reduceToSingleDigit(soulSum),
    personalityNumber: reduceToSingleDigit(personalitySum),
    mobileVibration: reduceToSingleDigit(mobileSum),
    compoundNumber: nameSum,
    personalYear: reduceToSingleDigit(personalYearSum),
    nameCompatibilityScore: compatibility,
  };
}

export async function generateReport(
  clientDetails: ClientDetails
): Promise<ReadableStream> {
  const numerology = computeNumerologyData(clientDetails);
  const userMessage = buildReportPrompt(clientDetails, numerology);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const anthropicStream = client.messages.stream({
          model: "claude-sonnet-4-5",
          max_tokens: 8192,
          system: [
            {
              type: "text",
              text: REPORT_SYSTEM_PROMPT,
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

export async function getReportText(
  clientDetails: ClientDetails
): Promise<string> {
  const numerology = computeNumerologyData(clientDetails);
  const userMessage = buildReportPrompt(clientDetails, numerology);

  const stream = client.messages.stream({
    model: "claude-sonnet-4-5",
    max_tokens: 8192,
    system: [
      {
        type: "text",
        text: REPORT_SYSTEM_PROMPT,
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

function buildReportPrompt(
  details: ClientDetails,
  numerology: NumerologyData
): string {
  return `Generate a complete personalised Chaldean numerology report for this client.

CLIENT DETAILS:
- Full Name: ${details.fullName}
- Date of Birth: ${details.dateOfBirth}
- Mobile Number: ${details.mobileNumber}
${details.additionalContext ? `- Additional context: ${details.additionalContext}` : ""}

PRE-CALCULATED NUMEROLOGY DATA:
- Destiny Number (Full Name): ${numerology.destinyNumber}
- Soul Number (Vowels): ${numerology.soulNumber}
- Personality Number (Consonants): ${numerology.personalityNumber}
- Mobile Number Vibration: ${numerology.mobileVibration}
- Compound Name Number (before reduction): ${numerology.compoundNumber}
- Personal Year Number (${new Date().getFullYear()}): ${numerology.personalYear}
- Name-Mobile Compatibility Score: ${numerology.nameCompatibilityScore}/10

Write the full premium report now. Address the client directly by their first name throughout. The report should feel like Rekha Verma Anka personally analysed their numbers and wrote this just for them.

Important: In the Name Correction section, always suggest a small, practical change (adding/removing a letter, or a spelling variation) that would improve their numerology profile — this creates an opportunity for follow-up consultation.

Close with a warm personal message from Rekha inviting them to WhatsApp her for deeper guidance.`;
}
