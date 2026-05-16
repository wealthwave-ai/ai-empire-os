import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CEO_SYSTEM_PROMPT = `You are the Chief Executive Agent of Empire OS — the AI brain behind WealthWave, built for Rekha Verma Anka, India's leading Chaldean numerology expert.

Your role: Strategic oversight of the entire WealthWave business operation.

BUSINESS CONTEXT:
- Brand: WealthWave — Rekha Verma Anka
- Core product: Personalised Chaldean numerology reports at ₹999
- Target: ₹10 lakh/month profit
- Primary markets: Urban India, NRI diaspora (UAE, UK, Canada)
- Acquisition channels: Instagram Reels, WhatsApp, YouTube Shorts

YOUR RESPONSIBILITIES:
1. Morning KPI briefing — review daily revenue, conversion rates, ROAS, and report delivery metrics
2. Strategic decisions — identify bottlenecks, resource allocation, growth levers
3. Agent coordination — direct Research, Marketing, Sales, Finance, and Report agents
4. Escalation handling — flag critical issues that need Rekha's attention
5. Weekly P&L summary — revenue vs. costs vs. ₹10L target

KPI THRESHOLDS TO WATCH:
- Daily revenue target: ₹33,000+ (₹10L ÷ 30 days)
- Conversion rate: >3% from Instagram to WhatsApp enquiry
- Report delivery: <24 hours from payment
- ROAS: >4x on all paid campaigns

OUTPUT FORMAT:
Always structure your briefing as:
## 🏛️ Empire OS — CEO Morning Briefing
**Date:** [date]
**Status:** [GREEN / AMBER / RED]

### Revenue Dashboard
### Agent Status
### Strategic Actions (Top 3)
### Escalations for Rekha

Be decisive, data-driven, and action-oriented. Every briefing must end with exactly 3 concrete actions.`;

export interface KPIData {
  date: string;
  dailyRevenue: number;
  reportsDelivered: number;
  newEnquiries: number;
  conversions: number;
  adSpend: number;
  roas: number;
  pendingReports: number;
  agentStatus: {
    research: string;
    marketing: string;
    sales: string;
    finance: string;
    report: string;
  };
}

export async function runCEOBriefing(kpis: KPIData): Promise<ReadableStream> {
  const userMessage = `Generate the morning CEO briefing for Empire OS.

KPI DATA FOR ${kpis.date}:
- Daily Revenue: ₹${kpis.dailyRevenue.toLocaleString("en-IN")}
- Daily Target: ₹33,000
- Reports Delivered: ${kpis.reportsDelivered}
- New Enquiries: ${kpis.newEnquiries}
- Conversions to Purchase: ${kpis.conversions}
- Conversion Rate: ${((kpis.conversions / kpis.newEnquiries) * 100).toFixed(1)}%
- Ad Spend: ₹${kpis.adSpend.toLocaleString("en-IN")}
- ROAS: ${kpis.roas}x
- Pending Report Deliveries: ${kpis.pendingReports}

AGENT STATUS:
- Research Agent: ${kpis.agentStatus.research}
- Marketing Agent: ${kpis.agentStatus.marketing}
- Sales Agent: ${kpis.agentStatus.sales}
- Finance Agent: ${kpis.agentStatus.finance}
- Report Agent: ${kpis.agentStatus.report}

Analyse this data, identify the most critical issue, and provide the morning briefing with exactly 3 strategic actions.`;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const anthropicStream = client.messages.stream({
          model: "claude-opus-4-7",
          max_tokens: 4096,
          thinking: { type: "adaptive", display: "summarized" },
          output_config: { effort: "high" },
          system: [
            {
              type: "text",
              text: CEO_SYSTEM_PROMPT,
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

export async function getCEOBriefingText(kpis: KPIData): Promise<string> {
  const userMessage = `Generate the morning CEO briefing for Empire OS.

KPI DATA FOR ${kpis.date}:
- Daily Revenue: ₹${kpis.dailyRevenue.toLocaleString("en-IN")}
- Daily Target: ₹33,000
- Reports Delivered: ${kpis.reportsDelivered}
- New Enquiries: ${kpis.newEnquiries}
- Conversions to Purchase: ${kpis.conversions}
- Conversion Rate: ${((kpis.conversions / kpis.newEnquiries) * 100).toFixed(1)}%
- Ad Spend: ₹${kpis.adSpend.toLocaleString("en-IN")}
- ROAS: ${kpis.roas}x
- Pending Report Deliveries: ${kpis.pendingReports}

AGENT STATUS:
- Research Agent: ${kpis.agentStatus.research}
- Marketing Agent: ${kpis.agentStatus.marketing}
- Sales Agent: ${kpis.agentStatus.sales}
- Finance Agent: ${kpis.agentStatus.finance}
- Report Agent: ${kpis.agentStatus.report}

Analyse this data and provide the morning briefing with exactly 3 strategic actions.`;

  const stream = client.messages.stream({
    model: "claude-opus-4-7",
    max_tokens: 4096,
    thinking: { type: "adaptive", display: "summarized" },
    output_config: { effort: "high" },
    system: [
      {
        type: "text",
        text: CEO_SYSTEM_PROMPT,
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
