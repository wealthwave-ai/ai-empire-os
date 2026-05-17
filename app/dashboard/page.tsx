"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import KPICard from "@/components/dashboard/KPICard";
import DepartmentCard from "@/components/dashboard/DepartmentCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import CEOAgentPanel from "@/components/dashboard/CEOAgentPanel";

const DEPARTMENTS = [
  { name: "MARKETING",  icon: "📡", status: "ACTIVE"  as const, metric: "3 scripts",  metricLabel: "GENERATED TODAY",    tasksRun: 47,  model: "claude-sonnet-4-5" },
  { name: "SALES",      icon: "⚡", status: "ACTIVE"  as const, metric: "₹12,400",    metricLabel: "PIPELINE VALUE",      tasksRun: 23,  model: "claude-sonnet-4-5" },
  { name: "FINANCE",    icon: "💹", status: "ACTIVE"  as const, metric: "3.8x",       metricLabel: "ROAS TODAY",          tasksRun: 12,  model: "claude-sonnet-4-5" },
  { name: "RESEARCH",   icon: "🔬", status: "ACTIVE"  as const, metric: "12 hooks",   metricLabel: "VIRAL CANDIDATES",    tasksRun: 8,   model: "claude-opus-4-7"   },
  { name: "OPERATIONS", icon: "⚙️", status: "IDLE"    as const, metric: "99.98%",     metricLabel: "UPTIME",              tasksRun: 3,   model: "system"            },
  { name: "PRODUCT",    icon: "◇",  status: "STANDBY" as const, metric: "—",          metricLabel: "NO TASKS",            tasksRun: 0,   model: "—"                 },
  { name: "SUPPORT",    icon: "🛡️", status: "IDLE"    as const, metric: "0 tickets",  metricLabel: "OPEN ISSUES",         tasksRun: 2,   model: "claude-sonnet-4-5" },
  { name: "REPORT",     icon: "📄", status: "ACTIVE"  as const, metric: "2 pending",  metricLabel: "IN GENERATION",       tasksRun: 31,  model: "claude-sonnet-4-5" },
];

const HEALTH_METRICS = [
  { label: "CPU",      value: 34,  unit: "%", color: "#00FF41" },
  { label: "MEM",      value: 61,  unit: "%", color: "#00FFFF" },
  { label: "API CALLS",value: 187, unit: "/h", color: "#00FF41" },
  { label: "LATENCY",  value: 1.2, unit: "s",  color: "#00FFFF" },
  { label: "CACHE HIT",value: 87,  unit: "%", color: "#00FF41" },
  { label: "ERRORS",   value: 0,   unit: "",  color: "#00FF41" },
];

function LiveClock() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-IN", { hour12: false, timeZone: "Asia/Kolkata" }));
      setDate(now.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="font-mono text-right">
      <div style={{ fontSize: "20px", fontWeight: 700, color: "#00FF41", textShadow: "0 0 12px #00FF41", letterSpacing: "0.1em" }}>
        {time}<span style={{ animation: "blink-cursor 1s step-end infinite" }}>_</span>
      </div>
      <div style={{ fontSize: "9px", color: "#00FF4166", letterSpacing: "0.2em" }}>{date} IST</div>
    </div>
  );
}

function CEOCard() {
  const [thinking, setThinking] = useState(true);
  const [dots, setDots] = useState("...");

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((d) => (d.length >= 6 ? "." : d + "."));
    }, 400);
    const thinkInterval = setInterval(() => {
      setThinking((t) => !t);
    }, 8000);
    return () => { clearInterval(dotInterval); clearInterval(thinkInterval); };
  }, []);

  return (
    <div
      className="font-mono relative overflow-hidden"
      style={{
        background: "#000",
        borderRadius: "12px",
        padding: "20px 24px",
        border: "1px solid #00FF41",
        boxShadow: "0 0 30px #00FF4133, 0 0 60px #00FF4122, inset 0 0 40px #00FF4108",
        animation: "spin-border 4s linear infinite",
      }}
    >
      {/* Rotating corner accents */}
      {[
        { top: 0, left: 0, borderTop: "2px solid #00FF41", borderLeft: "2px solid #00FF41" },
        { top: 0, right: 0, borderTop: "2px solid #00FFFF", borderRight: "2px solid #00FFFF" },
        { bottom: 0, left: 0, borderBottom: "2px solid #00FFFF", borderLeft: "2px solid #00FFFF" },
        { bottom: 0, right: 0, borderBottom: "2px solid #00FF41", borderRight: "2px solid #00FF41" },
      ].map((s, i) => (
        <div key={i} style={{ position: "absolute", width: "20px", height: "20px", ...s }} />
      ))}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "10px", letterSpacing: "0.3em", color: "#00FF4188", marginBottom: "4px" }}>AI CHIEF EXECUTIVE OFFICER</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#fff", letterSpacing: "0.1em" }}>
            REKHA VERMA ANKA
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              border: "1px solid #00FF41",
              borderRadius: "4px",
              background: "#00FF4115",
              boxShadow: "0 0 12px #00FF4144",
            }}
          >
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00FF41", boxShadow: "0 0 8px #00FF41", animation: "pulse-dot 1s ease-in-out infinite" }} />
            <span style={{ fontSize: "9px", letterSpacing: "0.2em", color: "#00FF41" }}>ONLINE</span>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div
        style={{
          background: "#00FF4108",
          border: "1px solid #00FF4133",
          borderRadius: "6px",
          padding: "12px 16px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00FF41", boxShadow: "0 0 10px #00FF41", flexShrink: 0, animation: "pulse-dot 1.5s ease-in-out infinite" }} />
        <div>
          <div style={{ fontSize: "11px", color: "#00FF41", letterSpacing: "0.15em", fontWeight: 600 }}>
            {thinking ? `PROCESSING${dots}` : "BRIEFING COMPLETE ✓"}
          </div>
          <div style={{ fontSize: "9px", color: "#ffffff44", marginTop: "3px", letterSpacing: "0.1em" }}>
            {thinking
              ? "Analysing KPI data — claude-opus-4-7 (adaptive thinking)"
              : "Next briefing scheduled: 02:00 IST · Target ₹10,00,000/month"}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
        {[
          { label: "AGENTS ACTIVE", value: "5/8" },
          { label: "TODAY REVENUE", value: "₹0" },
          { label: "DAILY TARGET", value: "₹33K" },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#00FF41", textShadow: "0 0 10px #00FF41" }}>{s.value}</div>
            <div style={{ fontSize: "8px", color: "#ffffff33", letterSpacing: "0.15em", marginTop: "2px" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

        * { box-sizing: border-box; }

        @keyframes blink-cursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        @keyframes card-scan {
          0%   { top: 0%; }
          100% { top: 100%; }
        }

        @keyframes slide-bar {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes spin-border {
          0%   { box-shadow: 0 0 30px #00FF4133, 0 0 60px #00FF4122, inset 0 0 40px #00FF4108; }
          25%  { box-shadow: 0 0 30px #00FFFF33, 0 0 60px #00FFFF22, inset 0 0 40px #00FFFF08; }
          50%  { box-shadow: 0 0 30px #00FF4133, 0 0 60px #00FF4122, inset 0 0 40px #00FF4108; }
          75%  { box-shadow: 0 0 30px #00FFFF33, 0 0 60px #00FFFF22, inset 0 0 40px #00FFFF08; }
          100% { box-shadow: 0 0 30px #00FF4133, 0 0 60px #00FF4122, inset 0 0 40px #00FF4108; }
        }

        @keyframes glow-pulse-green {
          0%, 100% { text-shadow: 0 0 8px #00FF41, 0 0 16px #00FF41; }
          50%       { text-shadow: 0 0 20px #00FF41, 0 0 40px #00FF41, 0 0 60px #00FF4155; }
        }

        @keyframes hbar {
          0%   { background-position: 0% 0%; }
          100% { background-position: 100% 0%; }
        }

        .empire-scrollbar::-webkit-scrollbar { width: 4px; }
        .empire-scrollbar::-webkit-scrollbar-track { background: #000; }
        .empire-scrollbar::-webkit-scrollbar-thumb { background: #00FF4133; border-radius: 2px; }
        .empire-scrollbar::-webkit-scrollbar-thumb:hover { background: #00FF4166; }
      `}</style>

      <div
        className="empire-scrollbar"
        style={{
          minHeight: "100vh",
          background: "#000000",
          color: "#fff",
          fontFamily: "'Share Tech Mono', 'Courier New', monospace",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Scanline overlay */}
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            pointerEvents: "none",
            background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.015) 2px, rgba(0,255,65,0.015) 4px)",
          }}
        />
        {/* Moving scanline */}
        <div
          aria-hidden
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            height: "120px",
            background: "linear-gradient(transparent, rgba(0,255,65,0.04), transparent)",
            zIndex: 51,
            pointerEvents: "none",
            animation: "scanline 8s linear infinite",
          }}
        />
        {/* Grid bg */}
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            backgroundImage: "linear-gradient(rgba(0,255,65,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* ── TOP HEADER BAR ── */}
        <header
          style={{
            position: "relative",
            zIndex: 10,
            borderBottom: "1px solid #00FF4133",
            padding: "0 20px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(0,0,0,0.95)",
            backdropFilter: "blur(8px)",
            flexShrink: 0,
          }}
        >
          {/* Left — Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  letterSpacing: "0.3em",
                  color: "#00FF41",
                  textShadow: "0 0 16px #00FF41",
                  animation: "glow-pulse-green 3s ease-in-out infinite",
                }}
              >
                EMPIRE OS
              </div>
              <div style={{ fontSize: "8px", letterSpacing: "0.4em", color: "#00FF4155", marginTop: "2px" }}>
                v1.0 · WEALTHWAVE AI
              </div>
            </div>
            <div style={{ width: "1px", height: "32px", background: "#00FF4133" }} />
            <div style={{ fontSize: "9px", color: "#00FF4188", letterSpacing: "0.15em" }}>
              REKHA VERMA ANKA
            </div>
          </div>

          {/* Center — System status indicators */}
          <div style={{ display: "flex", gap: "20px" }}>
            {[
              { label: "AGENTS",   value: "5 ACTIVE",  color: "#00FF41" },
              { label: "REVENUE",  value: "₹0 TODAY",  color: "#00FFFF" },
              { label: "API",      value: "NOMINAL",   color: "#00FF41" },
              { label: "SECURITY", value: "LOCKED",    color: "#00FF41" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: s.color, textShadow: `0 0 8px ${s.color}`, letterSpacing: "0.05em" }}>{s.value}</div>
                <div style={{ fontSize: "7px", color: "#ffffff33", letterSpacing: "0.2em" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Right — Clock */}
          <LiveClock />
        </header>

        {/* ── MAIN CONTENT ── */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative", zIndex: 10 }}>

          {/* Left Sidebar */}
          <Sidebar />

          {/* Center — Main Content */}
          <main
            className="empire-scrollbar"
            style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {/* CEO Card */}
            <CEOCard />

            {/* CEO Agent — Numerology Report Generator */}
            <CEOAgentPanel />

            {/* KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
              <KPICard label="TOTAL REVENUE" value="₹0"   sub="TARGET ₹10,00,000"   accent="green" trend="flat" animating />
              <KPICard label="ACTIVE LEADS"  value="0"    sub="PIPELINE"             accent="cyan"  trend="flat" />
              <KPICard label="CONVERSIONS"   value="0%"   sub="ENQUIRY → PURCHASE"   accent="cyan"  trend="flat" />
              <KPICard label="AUTOMATION"    value="100%" sub="EMPIRE OS SCORE"       accent="green" trend="up"  />
            </div>

            {/* Department Cards Grid */}
            <div>
              <div style={{ fontSize: "9px", letterSpacing: "0.3em", color: "#00FF4166", marginBottom: "10px" }}>
                ▸ DEPARTMENT MATRIX
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                {DEPARTMENTS.map((dept) => (
                  <DepartmentCard key={dept.name} {...dept} />
                ))}
              </div>
            </div>
          </main>

          {/* Right Panel — Activity Feed */}
          <aside
            style={{
              width: "320px",
              flexShrink: 0,
              padding: "16px 12px 16px 0",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ fontSize: "9px", letterSpacing: "0.3em", color: "#00FFFF66", marginBottom: "10px" }}>
              ▸ LIVE ACTIVITY STREAM
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ActivityFeed />
            </div>
          </aside>
        </div>

        {/* ── BOTTOM BAR ── */}
        <footer
          style={{
            position: "relative",
            zIndex: 10,
            borderTop: "1px solid #00FF4122",
            padding: "8px 20px",
            display: "flex",
            alignItems: "center",
            gap: "24px",
            background: "rgba(0,0,0,0.95)",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: "8px", letterSpacing: "0.25em", color: "#00FF4155" }}>SYSTEM HEALTH</span>
          <div style={{ width: "1px", height: "16px", background: "#00FF4122" }} />
          {HEALTH_METRICS.map((m) => (
            <div key={m.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "7px", letterSpacing: "0.2em", color: "#ffffff33" }}>{m.label}</span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: m.color, textShadow: `0 0 6px ${m.color}` }}>
                {m.value}{m.unit}
              </span>
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#00FF41", boxShadow: "0 0 6px #00FF41", animation: "pulse-dot 2s ease-in-out infinite" }} />
            <span style={{ fontSize: "8px", letterSpacing: "0.2em", color: "#00FF4188" }}>ALL SYSTEMS OPERATIONAL</span>
          </div>
        </footer>
      </div>
    </>
  );
}
