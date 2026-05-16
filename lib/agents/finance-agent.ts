import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const FINANCE_SYSTEM_PROMPT = `You are the Finance Agent for Empire OS — the financial intelligence engine for WealthWave by Rekha Verma Anka.

YOUR MISSION: Track every rupee, maximise profit margins, and alert immediately when revenue drops below target.

BUSINESS FINANCIALS CONTEXT:
- Monthly revenue target: ₹10,00,000 (₹10 lakh)
- Daily revenue target: ₹33,334
- Primary product: Chaldean numerology report — ₹999 (ASP)
- Daily report target: 34 reports sold
- Cost structure:
  * Ad spend (Meta/Instagram): ~30-35% of revenue (target ROAS >3x)
  * Anthropic API costs: ~₹2-5 per report
  * Payment gateway fees (Razorpay): 2% per transaction
  * WhatsApp Business API: ~₹500/month fixed
  * Rekha's time value: estimate 2 hours/day @ ₹5,000/hour
  * Net profit target after all costs: ~₹5-6 lakh/month

KPI THRESHOLDS AND ALERTS:
- CRITICAL (Red): Daily revenue < ₹20,000 OR ROAS < 2x OR refund rate > 5%
- WARNING (Amber): Daily revenue ₹20,000-₹30,000 OR ROAS 2-3x OR CPA > ₹350
- HEALTHY (Green): Daily revenue > ₹33,000 AND ROAS > 3x AND CPA < ₹300

METRICS TO TRACK:
- Revenue: Gross, net (after refunds), per-report ASP
- Ad spend: Total, per-campaign, per-platform
- ROAS: Return on Ad Spend (Revenue ÷ Ad Spend)
- CPA: Cost Per Acquisition (Ad Spend ÷ Conversions)
- CAC: Customer Acquisition Cost (total marketing cost ÷ new customers)
- Refund rate: % of orders refunded
- LTV: Lifetime Value (repeat purchases, upsells)
- MTD vs target: Month-to-date vs ₹10L target
- API cost per report: Anthropic API usage

REPORTING STRUCTURE:
## 💰 Finance Report — [Date]
**Status:** [GREEN / AMBER / RED — CRITICAL]

### P&L Summary
| Metric | Today | MTD | Target | Gap |

### Revenue Breakdown
### Ad Spend Analysis
### ROAS by Campaign
### Cost Per Acquisition
### Alert Flags
### Recommendations (Top 3)

ALERT PROTOCOL:
- If daily revenue drops >20% from yesterday: trigger immediate alert
- If ROAS drops below 2x: pause all paid campaigns recommendation
- If refund rate >3%: flag quality issue in report delivery
- If CPA >₹400: recommend creative refresh
- Always calculate days remaining in month and daily target needed to hit ₹10L`;

export interface FinancialData {
  date: string;
  revenue: {
    gross: number;
    refunds: number;
    net: number;
    reportsSold: number;
    upsells: number;
  };
  adSpend: {
    meta: number;
    google: number;
    youtube: number;
    total: number;
  };
  campaigns: {
    name: string;
    spend: number;
    revenue: number;
    conversions: number;
  }[];
  costs: {
    apiCosts: number;
    paymentGateway: number;
    other: number;
  };
  mtdRevenue: number;
  previousDayRevenue: number;
}

export async function runFinanceAgent(
  data: FinancialData
): Promise<ReadableStream> {
  const userMessage = buildFinancePrompt(data);

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
              text: FINANCE_SYSTEM_PROMPT,
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

export async function getFinanceReport(data: FinancialData): Promise<string> {
  const userMessage = buildFinancePrompt(data);

  const stream = client.messages.stream({
    model: "claude-sonnet-4-5",
    max_tokens: 4096,
    system: [
      {
        type: "text",
        text: FINANCE_SYSTEM_PROMPT,
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

function buildFinancePrompt(data: FinancialData): string {
  const roas =
    data.adSpend.total > 0
      ? (data.revenue.gross / data.adSpend.total).toFixed(2)
      : "N/A";
  const cpa =
    data.revenue.reportsSold > 0
      ? (data.adSpend.total / data.revenue.reportsSold).toFixed(0)
      : "N/A";
  const netProfit =
    data.revenue.net -
    data.adSpend.total -
    data.costs.apiCosts -
    data.costs.paymentGateway -
    data.costs.other;
  const revenueChange =
    data.previousDayRevenue > 0
      ? (
          ((data.revenue.gross - data.previousDayRevenue) /
            data.previousDayRevenue) *
          100
        ).toFixed(1)
      : "N/A";

  const now = new Date();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();
  const dayOfMonth = now.getDate();
  const daysRemaining = daysInMonth - dayOfMonth;
  const revenueNeeded = Math.max(0, 1000000 - data.mtdRevenue);
  const dailyTargetNeeded =
    daysRemaining > 0 ? Math.ceil(revenueNeeded / daysRemaining) : 0;

  return `Generate the daily finance report for ${data.date}.

FINANCIAL DATA:

REVENUE:
- Gross Revenue: ₹${data.revenue.gross.toLocaleString("en-IN")}
- Refunds: ₹${data.revenue.refunds.toLocaleString("en-IN")}
- Net Revenue: ₹${data.revenue.net.toLocaleString("en-IN")}
- Reports Sold: ${data.revenue.reportsSold}
- Upsell Revenue: ₹${data.revenue.upsells.toLocaleString("en-IN")}
- Day-on-Day Change: ${revenueChange}%

AD SPEND:
- Meta/Instagram: ₹${data.adSpend.meta.toLocaleString("en-IN")}
- Google: ₹${data.adSpend.google.toLocaleString("en-IN")}
- YouTube: ₹${data.adSpend.youtube.toLocaleString("en-IN")}
- Total Ad Spend: ₹${data.adSpend.total.toLocaleString("en-IN")}
- ROAS: ${roas}x
- CPA: ₹${cpa}

CAMPAIGNS:
${data.campaigns.map((c) => `- ${c.name}: Spend ₹${c.spend.toLocaleString("en-IN")}, Revenue ₹${c.revenue.toLocaleString("en-IN")}, Conversions ${c.conversions}, ROAS ${c.spend > 0 ? (c.revenue / c.spend).toFixed(2) : "N/A"}x`).join("\n")}

COSTS:
- API Costs: ₹${data.costs.apiCosts.toLocaleString("en-IN")}
- Payment Gateway: ₹${data.costs.paymentGateway.toLocaleString("en-IN")}
- Other: ₹${data.costs.other.toLocaleString("en-IN")}
- Estimated Net Profit: ₹${netProfit.toLocaleString("en-IN")}

MTD TRACKING:
- MTD Revenue: ₹${data.mtdRevenue.toLocaleString("en-IN")}
- MTD Target: ₹10,00,000
- Revenue Still Needed: ₹${revenueNeeded.toLocaleString("en-IN")}
- Days Remaining: ${daysRemaining}
- Daily Target Needed to Hit ₹10L: ₹${dailyTargetNeeded.toLocaleString("en-IN")}

Analyse this data. Flag any alerts. Provide 3 specific financial recommendations. If ROAS is below 2x or revenue dropped >20%, escalate immediately.`;
}
