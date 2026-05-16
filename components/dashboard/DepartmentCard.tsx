"use client";

interface DepartmentCardProps {
  name: string;
  icon: string;
  status: "ACTIVE" | "IDLE" | "STANDBY";
  metric?: string;
  metricLabel?: string;
  tasksRun?: number;
  model?: string;
}

export default function DepartmentCard({
  name,
  icon,
  status,
  metric,
  metricLabel,
  tasksRun = 0,
  model,
}: DepartmentCardProps) {
  const isActive = status === "ACTIVE";
  const isIdle = status === "IDLE";

  const borderColor = isActive ? "#00FF41" : isIdle ? "#00FFFF44" : "#ffffff15";
  const glowColor   = isActive ? "#00FF4144" : "#00FFFF22";
  const dotColor    = isActive ? "#00FF41" : isIdle ? "#00FFFF" : "#ffffff33";
  const statusColor = isActive ? "#00FF41" : isIdle ? "#00FFFF" : "#ffffff33";

  return (
    <div
      className="font-mono relative overflow-hidden"
      style={{
        background: "#000",
        border: `1px solid ${borderColor}`,
        borderRadius: "8px",
        padding: "14px",
        boxShadow: isActive
          ? `0 0 20px ${glowColor}, 0 0 40px ${glowColor}`
          : `0 0 8px ${glowColor}`,
        transition: "all 0.3s",
      }}
    >
      {/* Active glow top bar */}
      {isActive && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: "linear-gradient(90deg, transparent, #00FF41, transparent)",
            animation: "slide-bar 2s linear infinite",
          }}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px", filter: isActive ? "drop-shadow(0 0 6px #00FF41)" : "none" }}>{icon}</span>
          <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", color: isActive ? "#fff" : "#ffffff88" }}>
            {name}
          </span>
        </div>

        {/* Status badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "2px 8px",
            border: `1px solid ${statusColor}`,
            borderRadius: "4px",
            background: isActive ? "#00FF4115" : "transparent",
          }}
        >
          <div
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: dotColor,
              boxShadow: isActive ? `0 0 6px ${dotColor}` : "none",
              animation: isActive ? "pulse-dot 1.5s ease-in-out infinite" : "none",
            }}
          />
          <span style={{ fontSize: "8px", letterSpacing: "0.2em", color: statusColor }}>
            {status}
          </span>
        </div>
      </div>

      {/* Metric */}
      {metric && (
        <div style={{ marginBottom: "8px" }}>
          <div style={{ fontSize: "20px", fontWeight: 700, color: isActive ? "#00FF41" : "#00FFFF", textShadow: isActive ? "0 0 10px #00FF41" : "none" }}>
            {metric}
          </div>
          {metricLabel && (
            <div style={{ fontSize: "9px", color: "#ffffff44", letterSpacing: "0.15em", marginTop: "2px" }}>
              {metricLabel}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #ffffff0a", paddingTop: "8px" }}>
        <span style={{ fontSize: "8px", color: "#ffffff33", letterSpacing: "0.1em" }}>
          TASKS: <span style={{ color: "#ffffff55" }}>{tasksRun}</span>
        </span>
        {model && (
          <span style={{ fontSize: "8px", color: "#00FFFF44", letterSpacing: "0.05em" }}>
            {model}
          </span>
        )}
      </div>
    </div>
  );
}
