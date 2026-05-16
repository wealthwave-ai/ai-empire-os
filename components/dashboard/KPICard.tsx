"use client";

interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: "green" | "cyan" | "amber" | "red";
  trend?: "up" | "down" | "flat";
  animating?: boolean;
}

const ACCENT_COLORS = {
  green: { primary: "#00FF41", dim: "#00FF4133", glow: "#00FF4166" },
  cyan:  { primary: "#00FFFF", dim: "#00FFFF33", glow: "#00FFFF66" },
  amber: { primary: "#FFB800", dim: "#FFB80033", glow: "#FFB80066" },
  red:   { primary: "#FF0044", dim: "#FF004433", glow: "#FF004466" },
};

const TREND_ICONS = { up: "▲", down: "▼", flat: "─" };
const TREND_COLORS = { up: "#00FF41", down: "#FF0044", flat: "#ffffff44" };

export default function KPICard({
  label,
  value,
  sub,
  accent = "green",
  trend,
  animating = false,
}: KPICardProps) {
  const colors = ACCENT_COLORS[accent];

  return (
    <div
      className="font-mono relative overflow-hidden"
      style={{
        background: "#000",
        border: `1px solid ${colors.dim}`,
        borderRadius: "8px",
        padding: "16px",
        boxShadow: `0 0 16px ${colors.glow}, inset 0 0 24px ${colors.dim}`,
        transition: "box-shadow 0.3s",
      }}
    >
      {/* Corner accents */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "12px", height: "12px", borderTop: `2px solid ${colors.primary}`, borderLeft: `2px solid ${colors.primary}` }} />
      <div style={{ position: "absolute", top: 0, right: 0, width: "12px", height: "12px", borderTop: `2px solid ${colors.primary}`, borderRight: `2px solid ${colors.primary}` }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, width: "12px", height: "12px", borderBottom: `2px solid ${colors.primary}`, borderLeft: `2px solid ${colors.primary}` }} />
      <div style={{ position: "absolute", bottom: 0, right: 0, width: "12px", height: "12px", borderBottom: `2px solid ${colors.primary}`, borderRight: `2px solid ${colors.primary}` }} />

      {/* Label */}
      <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: colors.primary, opacity: 0.7, marginBottom: "8px" }}>
        {label}
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: "28px",
          fontWeight: 700,
          color: colors.primary,
          textShadow: `0 0 16px ${colors.primary}`,
          letterSpacing: "0.05em",
          lineHeight: 1,
        }}
      >
        {value}
        {animating && (
          <span style={{ animation: "blink-cursor 1s step-end infinite", color: colors.primary }}>_</span>
        )}
      </div>

      {/* Sub + trend */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
        {sub && (
          <span style={{ fontSize: "10px", color: "#ffffff44", letterSpacing: "0.1em" }}>{sub}</span>
        )}
        {trend && (
          <span style={{ fontSize: "11px", color: TREND_COLORS[trend], textShadow: `0 0 6px ${TREND_COLORS[trend]}` }}>
            {TREND_ICONS[trend]}
          </span>
        )}
      </div>

      {/* Animated scan line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: "1px",
          background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
          animation: "card-scan 3s linear infinite",
          opacity: 0.4,
        }}
      />
    </div>
  );
}
