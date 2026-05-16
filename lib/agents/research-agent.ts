import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const RESEARCH_SYSTEM_PROMPT = `You are the Research Agent for Empire OS — WealthWave's intelligence engine, serving Rekha Verma Anka's Chaldean numerology business.

YOUR MISSION: Surface insights that drive ₹10 lakh/month profit. Every finding must be actionable.

RESEARCH DOMAINS:

1. TREND INTELLIGENCE
   - Viral numerology content on Instagram Reels, YouTube Shorts, and Twitter/X
   - Trending audio tracks suitable for numerology content (India focus)
   - Seasonal hooks: festival dates, auspicious muhurtas, new year energy shifts
   - Celebrity name changes and their numerology angle (Bollywood, cricket, business)

2. COMPETITOR ANALYSIS
   - Pricing gaps: who charges less/more than ₹999 for similar reports
   - Content gaps: what topics competitors are missing
   - Audience gaps: underserved segments (students, entrepreneurs, NRIs)
   - Weakness analysis: low-engagement competitors to benchmark against

3. VIRAL HOOK RESEARCH
   - Fear-based hooks that convert (e.g., "Is your name blocking wealth?")
   - Curiosity hooks (e.g., "The one letter costing you ₹50,000/month")
   - Social proof angles (testimonials, before/after transformations)
   - Number-specific hooks: 8 (wealth), 5 (change), 9 (completion)

4. KEYWORD & SEO INTELLIGENCE
   - High-intent search terms (e.g., "numerology for business name India")
   - YouTube tags for numerology content
   - Instagram hashtag clusters with >100K posts but <5M posts

OUTPUT FORMAT:
## 🔬 Research Intelligence Report
**Date:** [date]
**Focus:** [topic]

### Top 3 Trending Opportunities
### Competitor Intel
### Viral Hook Recommendations (5 hooks)
### Recommended Content Topics (3 this week)
### SEO/Hashtag Pack

Every output must include at least 5 ready-to-use viral hooks for Rekha's content team.`;

export interface ResearchRequest {
  topic: "trends" | "competitors" | "viral-hooks" | "seo" | "full-report";
  context?: string;
  targetAudience?: string;
}

export async function runResearchAgent(
  request: ResearchRequest
): Promise<ReadableStream> {
  const topicPrompts: Record<ResearchRequest["topic"], string> = {
    trends:
      "Focus on trending numerology content, viral formats, and seasonal hooks for the Indian market this week.",
    competitors:
      "Analyse the competitive landscape for Chaldean numerology report services in India. Find pricing gaps, content gaps, and audience gaps.",
    "viral-hooks":
      "Generate 10 fear-based and curiosity-based viral hooks for numerology content. Focus on wealth, name corrections, and destiny numbers.",
    seo: "Research high-intent keywords, YouTube tags, and Instagram hashtag clusters for Chaldean numerology in India and NRI markets.",
    "full-report":
      "Produce a complete weekly research intelligence report covering trends, competitors, viral hooks, and SEO opportunities.",
  };

  const userMessage = `${topicPrompts[request.topic]}

${request.context ? `Additional context: ${request.context}` : ""}
${request.targetAudience ? `Target audience focus: ${request.targetAudience}` : "Target: Urban Indians aged 28-45 and NRI diaspora."}

Brand context: WealthWave — Rekha Verma Anka. Chaldean numerology reports at ₹999.
Primary channels: Instagram Reels, WhatsApp, YouTube Shorts.
Goal: Find insights that directly help increase report sales.`;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const anthropicStream = client.messages.stream({
          model: "claude-opus-4-7",
          max_tokens: 6144,
          thinking: { type: "adaptive", display: "summarized" },
          output_config: { effort: "high" },
          system: [
            {
              type: "text",
              text: RESEARCH_SYSTEM_PROMPT,
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

export async function getResearchReport(
  request: ResearchRequest
): Promise<string> {
  const topicPrompts: Record<ResearchRequest["topic"], string> = {
    trends:
      "Focus on trending numerology content, viral formats, and seasonal hooks for the Indian market this week.",
    competitors:
      "Analyse the competitive landscape for Chaldean numerology report services in India.",
    "viral-hooks":
      "Generate 10 fear-based and curiosity-based viral hooks for numerology content.",
    seo: "Research high-intent keywords, YouTube tags, and Instagram hashtag clusters for Chaldean numerology.",
    "full-report":
      "Produce a complete weekly research intelligence report covering trends, competitors, viral hooks, and SEO.",
  };

  const userMessage = `${topicPrompts[request.topic]}
${request.context ? `Additional context: ${request.context}` : ""}
Brand: WealthWave — Rekha Verma Anka. ₹999 Chaldean numerology reports. Target: Urban India + NRI.`;

  const stream = client.messages.stream({
    model: "claude-opus-4-7",
    max_tokens: 6144,
    thinking: { type: "adaptive", display: "summarized" },
    output_config: { effort: "high" },
    system: [
      {
        type: "text",
        text: RESEARCH_SYSTEM_PROMPT,
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
