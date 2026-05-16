import { getCEOBriefingText, type KPIData } from "./agents/ceo-agent";
import { getResearchReport, type ResearchRequest } from "./agents/research-agent";
import { getMarketingScripts, type MarketingRequest } from "./agents/marketing-agent";
import { getSalesSequence, type SalesRequest } from "./agents/sales-agent";
import { getReportText, type ClientDetails } from "./agents/report-agent";
import { getFinanceReport, type FinancialData } from "./agents/finance-agent";

export interface EmpireOSStatus {
  lastBriefing: Date | null;
  agentStatus: {
    ceo: "idle" | "running" | "error";
    research: "idle" | "running" | "error";
    marketing: "idle" | "running" | "error";
    sales: "idle" | "running" | "error";
    report: "idle" | "running" | "error";
    finance: "idle" | "running" | "error";
  };
  todayStats: {
    briefingsRun: number;
    reportsGenerated: number;
    salesSequencesCreated: number;
    marketingScriptsGenerated: number;
  };
}

const status: EmpireOSStatus = {
  lastBriefing: null,
  agentStatus: {
    ceo: "idle",
    research: "idle",
    marketing: "idle",
    sales: "idle",
    report: "idle",
    finance: "idle",
  },
  todayStats: {
    briefingsRun: 0,
    reportsGenerated: 0,
    salesSequencesCreated: 0,
    marketingScriptsGenerated: 0,
  },
};

export function getEmpireStatus(): EmpireOSStatus {
  return { ...status };
}

// Runs every day at 2am IST (UTC+5:30 = UTC 20:30 previous day)
// Set up a cron job or Vercel cron to call this at UTC 20:30
export async function runMorningBriefing(kpis?: KPIData): Promise<string> {
  status.agentStatus.ceo = "running";

  const defaultKPIs: KPIData = kpis ?? {
    date: new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Kolkata",
    }),
    dailyRevenue: 0,
    reportsDelivered: 0,
    newEnquiries: 0,
    conversions: 0,
    adSpend: 0,
    roas: 0,
    pendingReports: 0,
    agentStatus: {
      research: "Awaiting daily brief",
      marketing: "3 scripts queued",
      sales: "Active",
      finance: "Monitoring",
      report: "0 pending",
    },
  };

  try {
    const briefing = await getCEOBriefingText(defaultKPIs);
    status.agentStatus.ceo = "idle";
    status.lastBriefing = new Date();
    status.todayStats.briefingsRun++;
    return briefing;
  } catch (err) {
    status.agentStatus.ceo = "error";
    throw err;
  }
}

export async function runDailyResearch(
  topic: ResearchRequest["topic"] = "full-report"
): Promise<string> {
  status.agentStatus.research = "running";
  try {
    const report = await getResearchReport({ topic });
    status.agentStatus.research = "idle";
    return report;
  } catch (err) {
    status.agentStatus.research = "error";
    throw err;
  }
}

export async function generateDailyContent(
  request?: MarketingRequest
): Promise<string> {
  status.agentStatus.marketing = "running";
  try {
    const scripts = await getMarketingScripts(request ?? {});
    status.agentStatus.marketing = "idle";
    status.todayStats.marketingScriptsGenerated += 3;
    return scripts;
  } catch (err) {
    status.agentStatus.marketing = "error";
    throw err;
  }
}

export async function createSalesSequence(
  request: SalesRequest
): Promise<string> {
  status.agentStatus.sales = "running";
  try {
    const sequence = await getSalesSequence(request);
    status.agentStatus.sales = "idle";
    status.todayStats.salesSequencesCreated++;
    return sequence;
  } catch (err) {
    status.agentStatus.sales = "error";
    throw err;
  }
}

export async function deliverNumerologyReport(
  clientDetails: ClientDetails
): Promise<string> {
  status.agentStatus.report = "running";
  try {
    const report = await getReportText(clientDetails);
    status.agentStatus.report = "idle";
    status.todayStats.reportsGenerated++;
    return report;
  } catch (err) {
    status.agentStatus.report = "error";
    throw err;
  }
}

export async function runFinanceCheck(data: FinancialData): Promise<string> {
  status.agentStatus.finance = "running";
  try {
    const report = await getFinanceReport(data);
    status.agentStatus.finance = "idle";
    return report;
  } catch (err) {
    status.agentStatus.finance = "error";
    throw err;
  }
}

// Full daily automation — call this from a cron job at 2am IST
export async function runDailyAutomation(kpis?: KPIData): Promise<{
  briefing: string;
  research: string;
  content: string;
  timestamp: string;
}> {
  const timestamp = new Date().toISOString();

  const [briefing, research, content] = await Promise.all([
    runMorningBriefing(kpis),
    runDailyResearch("full-report"),
    generateDailyContent(),
  ]);

  return { briefing, research, content, timestamp };
}
