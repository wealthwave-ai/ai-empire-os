"use client";

import { useState } from "react";

const DEPARTMENTS = [
  { id: "ceo",        label: "CEO",         icon: "⬡", active: true  },
  { id: "marketing",  label: "MARKETING",   icon: "◈", active: true  },
  { id: "sales",      label: "SALES",       icon: "◆", active: true  },
  { id: "finance",    label: "FINANCE",     icon: "◉", active: true  },
  { id: "research",   label: "RESEARCH",    icon: "◎", active: true  },
  { id: "operations", label: "OPS",         icon: "⬢", active: false },
  { id: "product",    label: "PRODUCT",     icon: "◇", active: false },
  { id: "support",    label: "SUPPORT",     icon: "◈", active: false },
  { id: "trading",    label: "TRADING",     icon: "◉", active: false },
];

interface SidebarProps {
  onSelect?: (id: string) => void;
}

export default function Sidebar({ onSelect }: SidebarProps) {
  const [selected, setSelected] = useState("ceo");

  const handleClick = (id: string) => {
    setSelected(id);
    onSelect?.(id);
  };

  return (
    <aside
      className="flex flex-col items-center py-4 gap-1 font-mono"
      style={{
        width: "72px",
        background: "#000",
        borderRight: "1px solid #00FF4133",
        minHeight: "100%",
      }}
    >
      {/* Logo mark */}
      <div
        className="text-xs font-bold mb-4 tracking-widest"
        style={{ color: "#00FF41", textShadow: "0 0 8px #00FF41", writingMode: "vertical-rl", transform: "rotate(180deg)", letterSpacing: "0.25em" }}
      >
        EOS
      </div>

      <div
        style={{ width: "40px", height: "1px", background: "#00FF4133", margin: "4px 0 8px" }}
      />

      {DEPARTMENTS.map((dept) => {
        const isSelected = selected === dept.id;
        const isActive = dept.active;
        return (
          <button
            key={dept.id}
            onClick={() => handleClick(dept.id)}
            title={dept.label}
            style={{
              width: "48px",
              height: "48px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "2px",
              border: isSelected
                ? "1px solid #00FF41"
                : isActive
                ? "1px solid #00FF4155"
                : "1px solid #ffffff11",
              borderRadius: "6px",
              background: isSelected ? "#00FF4115" : "transparent",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: isSelected ? "0 0 12px #00FF4155, inset 0 0 8px #00FF4115" : "none",
              color: isSelected ? "#00FF41" : isActive ? "#00FF4188" : "#ffffff33",
              textShadow: isSelected ? "0 0 8px #00FF41" : "none",
              marginBottom: "2px",
            }}
          >
            <span style={{ fontSize: "16px" }}>{dept.icon}</span>
            <span style={{ fontSize: "7px", letterSpacing: "0.05em" }}>{dept.label.slice(0, 3)}</span>
          </button>
        );
      })}

      <div style={{ flex: 1 }} />

      {/* System status dot */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#00FF41",
            boxShadow: "0 0 8px #00FF41",
            animation: "pulse-dot 2s ease-in-out infinite",
          }}
        />
        <span style={{ fontSize: "7px", color: "#00FF4166", letterSpacing: "0.1em" }}>SYS</span>
      </div>
    </aside>
  );
}
