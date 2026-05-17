"use client";

import { useState, useRef, useEffect } from "react";

type Language = "hindi" | "english";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(0,255,65,0.04)",
  border: "1px solid #00FF4133",
  borderRadius: "6px",
  padding: "10px 14px",
  color: "#00FF41",
  fontFamily: "inherit",
  fontSize: "13px",
  outline: "none",
  letterSpacing: "0.05em",
};

export default function CEOAgentPanel() {
  const [mobile, setMobile] = useState("");
  const [name, setName]   = useState("");
  const [lang, setLang]   = useState<Language>("hindi");
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [done, setDone]     = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  // Auto-scroll as report streams in
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [report]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setReport("");
    setDone(false);

    const clean = mobile.replace(/[^0-9]/g, "");
    const digits = clean.length === 12 && clean.startsWith("91") ? clean.slice(2) : clean.slice(-10);
    if (digits.length !== 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/agents/numerology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: digits, language: lang, name: name.trim() || undefined }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Failed to generate report");
      }

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;

        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n\n");
        buf = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") { setDone(true); continue; }
          try {
            const { text, error: streamErr } = JSON.parse(payload) as { text?: string; error?: string };
            if (streamErr) throw new Error(streamErr);
            if (text) setReport((r) => r + text);
          } catch { /* ignore malformed chunks */ }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(report).catch(() => {});
  };

  return (
    <div
      style={{
        background: "#000",
        border: "1px solid #00FF4133",
        borderRadius: "12px",
        overflow: "hidden",
        fontFamily: "inherit",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid #00FF4122",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#00FF4106",
        }}
      >
        <div>
          <div style={{ fontSize: "9px", letterSpacing: "0.35em", color: "#00FF4166", marginBottom: "3px" }}>
            ▸ CEO AGENT · REKHA VERMA ANKA
          </div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#00FF41", letterSpacing: "0.15em" }}>
            CHALDEAN NUMEROLOGY ENGINE
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00FF41", boxShadow: "0 0 8px #00FF41", animation: "pulse-dot 1.5s ease-in-out infinite" }} />
          <span style={{ fontSize: "9px", letterSpacing: "0.2em", color: "#00FF41" }}>CLAUDE SONNET · LIVE</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", minHeight: "420px" }}>

        {/* ── Left: Input form ── */}
        <div
          style={{
            borderRight: "1px solid #00FF4122",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

            {/* Mobile */}
            <div>
              <label style={{ fontSize: "8px", letterSpacing: "0.3em", color: "#00FF4166", display: "block", marginBottom: "6px" }}>
                MOBILE NUMBER *
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="9876543210"
                maxLength={15}
                required
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#00FF4188")}
                onBlur={(e)  => (e.target.style.borderColor = "#00FF4133")}
              />
            </div>

            {/* Name */}
            <div>
              <label style={{ fontSize: "8px", letterSpacing: "0.3em", color: "#00FF4166", display: "block", marginBottom: "6px" }}>
                CUSTOMER NAME (OPTIONAL)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Amit Sharma"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#00FF4188")}
                onBlur={(e)  => (e.target.style.borderColor = "#00FF4133")}
              />
            </div>

            {/* Language toggle */}
            <div>
              <label style={{ fontSize: "8px", letterSpacing: "0.3em", color: "#00FF4166", display: "block", marginBottom: "8px" }}>
                LANGUAGE
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                {(["hindi", "english"] as Language[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "6px",
                      border: `1px solid ${lang === l ? "#00FF41" : "#00FF4133"}`,
                      background: lang === l ? "#00FF4115" : "transparent",
                      color: lang === l ? "#00FF41" : "#00FF4155",
                      fontSize: "10px",
                      letterSpacing: "0.2em",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      boxShadow: lang === l ? "0 0 12px #00FF4133" : "none",
                      transition: "all 0.15s",
                    }}
                  >
                    {l === "hindi" ? "हिंदी" : "ENGLISH"}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ fontSize: "10px", color: "#ff4444", letterSpacing: "0.1em", background: "#ff444411", border: "1px solid #ff444433", borderRadius: "4px", padding: "8px 12px" }}>
                ⚠ {error}
              </div>
            )}

            {/* Generate button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #00FF41",
                background: loading ? "#00FF4108" : "#00FF4120",
                color: "#00FF41",
                fontSize: "11px",
                letterSpacing: "0.25em",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                boxShadow: loading ? "none" : "0 0 20px #00FF4133",
                transition: "all 0.15s",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "GENERATING REPORT..." : "▶ GENERATE REPORT"}
            </button>
          </form>

          {/* Info box */}
          <div
            style={{
              marginTop: "auto",
              padding: "12px",
              border: "1px solid #00FF4122",
              borderRadius: "6px",
              background: "#00FF4106",
            }}
          >
            <div style={{ fontSize: "8px", letterSpacing: "0.2em", color: "#00FF4166", marginBottom: "6px" }}>CALCULATIONS</div>
            {mobile.replace(/[^0-9]/g, "").length >= 10 && (() => {
              const d = mobile.replace(/[^0-9]/g, "").slice(-10);
              const last7Sum = d.slice(3).split("").reduce((s, x) => s + parseInt(x), 0);
              const compound = d.split("").reduce((s, x) => s + parseInt(x), 0);
              const wealth = d.slice(3, 7).split("").reduce((s, x) => s + parseInt(x), 0);
              const reduce = (n: number): number => (n === 11 || n === 22 || n === 33 || n < 10) ? n : reduce(d.split("").reduce((s, x) => s + parseInt(x), 0) > 0 ? last7Sum % 9 || 9 : n); // simplified preview
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {[
                    ["COMPOUND", compound],
                    ["WEALTH",   wealth],
                    ["RULING",   parseInt(d[9])],
                  ].map(([label, val]) => (
                    <div key={label as string} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "9px", color: "#00FF4155", letterSpacing: "0.1em" }}>{label}</span>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#00FF41" }}>{val}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
            {mobile.replace(/[^0-9]/g, "").length < 10 && (
              <div style={{ fontSize: "9px", color: "#00FF4133", letterSpacing: "0.1em" }}>Enter mobile to preview numbers</div>
            )}
          </div>
        </div>

        {/* ── Right: Report output ── */}
        <div style={{ display: "flex", flexDirection: "column" }}>

          {/* Output header */}
          <div
            style={{
              borderBottom: "1px solid #00FF4122",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#00FF4104",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: "8px", letterSpacing: "0.3em", color: "#00FF4166" }}>
              {loading ? "▸ STREAMING FROM CLAUDE..." : done ? "▸ REPORT COMPLETE ✓" : "▸ REPORT OUTPUT"}
            </span>
            {report && (
              <button
                onClick={handleCopy}
                style={{
                  fontSize: "8px",
                  letterSpacing: "0.2em",
                  color: "#00FFFF",
                  background: "transparent",
                  border: "1px solid #00FFFF44",
                  borderRadius: "4px",
                  padding: "3px 8px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                COPY
              </button>
            )}
          </div>

          {/* Report text */}
          <div
            ref={outputRef}
            className="empire-scrollbar"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 20px",
              fontSize: "12px",
              lineHeight: "1.8",
              color: report ? "#e0ffe8" : "#00FF4133",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              letterSpacing: "0.02em",
            }}
          >
            {!report && !loading && (
              <div style={{ textAlign: "center", paddingTop: "80px" }}>
                <div style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.3 }}>🔢</div>
                <div style={{ fontSize: "9px", letterSpacing: "0.3em", color: "#00FF4133" }}>
                  ENTER MOBILE NUMBER AND GENERATE REPORT
                </div>
              </div>
            )}
            {loading && !report && (
              <div style={{ textAlign: "center", paddingTop: "80px" }}>
                <div style={{ fontSize: "9px", letterSpacing: "0.3em", color: "#00FF41", animation: "pulse-dot 1s ease-in-out infinite" }}>
                  ◉ REKHA VERMA ANALYSING YOUR NUMBER...
                </div>
              </div>
            )}
            {report}
            {loading && report && (
              <span style={{ color: "#00FF41", animation: "blink-cursor 1s step-end infinite" }}>▌</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
