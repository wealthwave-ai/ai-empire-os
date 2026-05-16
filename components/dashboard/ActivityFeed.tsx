"use client";

import { useEffect, useRef, useState } from "react";

interface LogEntry {
  id: number;
  time: string;
  agent: string;
  message: string;
  level: "info" | "success" | "warn" | "system";
}

const LEVEL_COLORS = {
  info:    "#00FFFF",
  success: "#00FF41",
  warn:    "#FFB800",
  system:  "#ffffff66",
};

const AGENT_COLORS: Record<string, string> = {
  CEO:       "#00FF41",
  RESEARCH:  "#00FFFF",
  MARKETING: "#FFB800",
  SALES:     "#FF6B35",
  FINANCE:   "#00FF41",
  REPORT:    "#00FFFF",
  SYSTEM:    "#ffffff44",
};

const LOG_POOL: Omit<LogEntry, "id" | "time">[] = [
  { agent: "CEO",       message: "Morning briefing complete. Revenue target on track.",       level: "success" },
  { agent: "MARKETING", message: "Generated 3 Reels scripts for today's content batch.",      level: "success" },
  { agent: "RESEARCH",  message: "Scanning trending numerology hooks — 12 candidates found.", level: "info"    },
  { agent: "SALES",     message: "WhatsApp sequence sent to 4 new leads from Instagram.",     level: "info"    },
  { agent: "FINANCE",   message: "ROAS check: 3.8x. All campaigns within threshold.",         level: "success" },
  { agent: "REPORT",    message: "Generating report for Priya S. — Destiny No. 8.",           level: "info"    },
  { agent: "RESEARCH",  message: "Competitor analysis: 2 pricing gaps identified.",            level: "success" },
  { agent: "MARKETING", message: "Hook A/B test: fear-based copy +22% CTR vs control.",       level: "success" },
  { agent: "SALES",     message: "Objection handled: 'price too high' — sent comparison.",    level: "info"    },
  { agent: "SYSTEM",    message: "Prompt cache hit rate: 87%. API cost saved: ₹140.",         level: "system"  },
  { agent: "FINANCE",   message: "WARNING: Ad spend 12% above daily budget.",                 level: "warn"    },
  { agent: "CEO",       message: "Escalation: Finance flagged budget overrun. Reviewing.",    level: "warn"    },
  { agent: "REPORT",    message: "Report delivered: Rajesh M. — Payment confirmed ₹999.",     level: "success" },
  { agent: "MARKETING", message: "YouTube Shorts script queued for upload.",                   level: "info"    },
  { agent: "SYSTEM",    message: "Anthropic API latency: 1.2s avg. All agents responsive.",   level: "system"  },
  { agent: "SALES",     message: "Upsell triggered: business name report offered to Meena.",  level: "info"    },
  { agent: "RESEARCH",  message: "Viral hook identified: '8 number waale crorepati kaise?'",  level: "success" },
  { agent: "FINANCE",   message: "MTD Revenue: ₹2,34,000 — Day 7 of 30.",                    level: "info"    },
  { agent: "CEO",       message: "Strategic action: Increase Reels output to 5/day.",          level: "success" },
  { agent: "SYSTEM",    message: "Empire OS uptime: 99.98%. All 6 agents nominal.",           level: "system"  },
];

function getTime() {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function ActivityFeed() {
  const [logs, setLogs] = useState<LogEntry[]>(() =>
    LOG_POOL.slice(0, 8).map((l, i) => ({ ...l, id: i, time: getTime() }))
  );
  const feedRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef(LOG_POOL.length);

  useEffect(() => {
    const interval = setInterval(() => {
      const pool = LOG_POOL[Math.floor(Math.random() * LOG_POOL.length)];
      const entry: LogEntry = { ...pool, id: counterRef.current++, time: getTime() };
      setLogs((prev) => [...prev.slice(-40), entry]);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      className="font-mono flex flex-col h-full"
      style={{ background: "#000", border: "1px solid #00FFFF22", borderRadius: "8px", overflow: "hidden" }}
    >
      {/* Header */}
      <div
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid #00FFFF22",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#00FFFF08",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00FF41", boxShadow: "0 0 8px #00FF41", animation: "pulse-dot 1s ease-in-out infinite" }} />
          <span style={{ fontSize: "9px", letterSpacing: "0.25em", color: "#00FFFF" }}>LIVE AI ACTIVITY</span>
        </div>
        <span style={{ fontSize: "8px", color: "#ffffff33", letterSpacing: "0.1em" }}>{logs.length} ENTRIES</span>
      </div>

      {/* Feed */}
      <div
        ref={feedRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          scrollBehavior: "smooth",
        }}
      >
        {logs.map((log) => (
          <div
            key={log.id}
            style={{
              display: "grid",
              gridTemplateColumns: "52px 68px 1fr",
              gap: "6px",
              padding: "5px 6px",
              borderRadius: "4px",
              background: log.level === "warn" ? "#FFB80008" : log.level === "success" ? "#00FF4108" : "transparent",
              borderLeft: `2px solid ${LEVEL_COLORS[log.level]}33`,
              alignItems: "start",
            }}
          >
            <span style={{ fontSize: "8px", color: "#ffffff33", letterSpacing: "0.05em", paddingTop: "1px" }}>
              {log.time}
            </span>
            <span
              style={{
                fontSize: "8px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: AGENT_COLORS[log.agent] ?? "#ffffff44",
                textShadow: log.level === "success" ? `0 0 6px ${AGENT_COLORS[log.agent]}` : "none",
              }}
            >
              [{log.agent}]
            </span>
            <span style={{ fontSize: "9px", color: log.level === "warn" ? "#FFB800" : log.level === "system" ? "#ffffff44" : "#ffffff99", lineHeight: 1.4 }}>
              {log.message}
            </span>
          </div>
        ))}
      </div>

      {/* Input prompt */}
      <div
        style={{
          padding: "8px 14px",
          borderTop: "1px solid #00FFFF22",
          background: "#00FF4108",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span style={{ fontSize: "9px", color: "#00FF41" }}>CEO@empire-os:~$</span>
        <span style={{ fontSize: "9px", color: "#00FF41", animation: "blink-cursor 1s step-end infinite" }}>▌</span>
      </div>
    </div>
  );
}
