import { NextRequest, NextResponse } from "next/server";
import { runCEOBriefing, type KPIData } from "@/lib/agents/ceo-agent";
import { runResearchAgent, type ResearchRequest } from "@/lib/agents/research-agent";
import { runMarketingAgent, type MarketingRequest } from "@/lib/agents/marketing-agent";
import { runSalesAgent, type SalesRequest } from "@/lib/agents/sales-agent";
import { generateReport, type ClientDetails } from "@/lib/agents/report-agent";
import { runFinanceAgent, type FinancialData } from "@/lib/agents/finance-agent";
import { getEmpireStatus, runDailyAutomation } from "@/lib/empire-os";

// GET /api/agents — Empire OS status
export async function GET() {
  const status = getEmpireStatus();
  return NextResponse.json({
    system: "Empire OS",
    brand: "WealthWave — Rekha Verma Anka",
    target: "₹10,00,000/month",
    status,
    agents: [
      "ceo",
      "research",
      "marketing",
      "sales",
      "report",
      "finance",
    ],
  });
}

// POST /api/agents — Route to the correct agent
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { agent } = body as { agent: string };

  if (!agent) {
    return NextResponse.json(
      { error: "Missing 'agent' field. Valid: ceo, research, marketing, sales, report, finance, daily-automation" },
      { status: 400 }
    );
  }

  try {
    switch (agent) {
      case "ceo": {
        const kpis = body.kpis as KPIData | undefined;
        if (!kpis) {
          return NextResponse.json(
            { error: "CEO agent requires 'kpis' object in body" },
            { status: 400 }
          );
        }
        const stream = await runCEOBriefing(kpis);
        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-store",
            Connection: "keep-alive",
            "X-Agent": "ceo",
          },
        });
      }

      case "research": {
        const request = body.request as ResearchRequest | undefined;
        if (!request?.topic) {
          return NextResponse.json(
            {
              error:
                "Research agent requires 'request.topic': trends | competitors | viral-hooks | seo | full-report",
            },
            { status: 400 }
          );
        }
        const stream = await runResearchAgent(request);
        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-store",
            Connection: "keep-alive",
            "X-Agent": "research",
          },
        });
      }

      case "marketing": {
        const request = (body.request as MarketingRequest | undefined) ?? {};
        const stream = await runMarketingAgent(request);
        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-store",
            Connection: "keep-alive",
            "X-Agent": "marketing",
          },
        });
      }

      case "sales": {
        const request = body.request as SalesRequest | undefined;
        if (!request?.sequenceType || !request?.clientProfile?.name) {
          return NextResponse.json(
            {
              error:
                "Sales agent requires 'request.sequenceType' and 'request.clientProfile.name'",
            },
            { status: 400 }
          );
        }
        const stream = await runSalesAgent(request);
        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-store",
            Connection: "keep-alive",
            "X-Agent": "sales",
          },
        });
      }

      case "report": {
        const clientDetails = body.clientDetails as ClientDetails | undefined;
        if (
          !clientDetails?.fullName ||
          !clientDetails?.dateOfBirth ||
          !clientDetails?.mobileNumber
        ) {
          return NextResponse.json(
            {
              error:
                "Report agent requires 'clientDetails' with fullName, dateOfBirth (DD/MM/YYYY), and mobileNumber",
            },
            { status: 400 }
          );
        }
        const stream = await generateReport(clientDetails);
        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-store",
            Connection: "keep-alive",
            "X-Agent": "report",
          },
        });
      }

      case "finance": {
        const data = body.data as FinancialData | undefined;
        if (!data?.date || !data?.revenue || !data?.adSpend) {
          return NextResponse.json(
            {
              error:
                "Finance agent requires 'data' with date, revenue, and adSpend objects",
            },
            { status: 400 }
          );
        }
        const stream = await runFinanceAgent(data);
        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-store",
            Connection: "keep-alive",
            "X-Agent": "finance",
          },
        });
      }

      case "daily-automation": {
        // Non-streaming: runs all morning agents in parallel and returns JSON
        const kpis = body.kpis as KPIData | undefined;
        const result = await runDailyAutomation(kpis);
        return NextResponse.json({
          success: true,
          timestamp: result.timestamp,
          briefing: result.briefing,
          research: result.research,
          content: result.content,
        });
      }

      default:
        return NextResponse.json(
          {
            error: `Unknown agent: '${agent}'. Valid agents: ceo, research, marketing, sales, report, finance, daily-automation`,
          },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error(`[Empire OS] Agent '${agent}' error:`, err);
    return NextResponse.json(
      {
        error: "Agent execution failed",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
