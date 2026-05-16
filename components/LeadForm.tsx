"use client";

import { useState } from "react";
import { MessageCircle, Phone, Loader2, CheckCircle2 } from "lucide-react";

const WHATSAPP_NUMBER = "919999999999";

function buildWhatsAppUrl(name: string, phone: string) {
  const greeting = name ? `Hello Rekha ji, I am ${name}.` : "Hello Rekha ji,";
  const msg = `${greeting} I would like to order my personalised Chaldean Numerology report. Price ₹999 confirmed. My mobile number is ${phone}.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export default function LeadForm() {
  const [name, setName]   = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phone.trim()) {
      setError("Please enter your WhatsApp number.");
      return;
    }
    if (!/^\+?[0-9]{7,15}$/.test(phone.replace(/\s/g, ""))) {
      setError("Please enter a valid phone number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          mobile_number: phone.trim(),
          source: "landing_page",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong");
      }

      setSubmitted(true);

      // Redirect to WhatsApp after a short delay so user sees success state
      setTimeout(() => {
        window.open(buildWhatsAppUrl(name, phone), "_blank", "noopener,noreferrer");
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "rgba(61,240,90,0.15)", border: "1px solid rgba(61,240,90,0.4)" }}
        >
          <CheckCircle2 size={32} style={{ color: "#3df05a" }} />
        </div>
        <div>
          <p className="text-lg font-bold text-white mb-1">You&apos;re all set!</p>
          <p className="text-sm" style={{ color: "#9ca3af" }}>
            Opening WhatsApp to connect with Rekha ji…
          </p>
        </div>
        <button
          onClick={() => window.open(buildWhatsAppUrl(name, phone), "_blank", "noopener,noreferrer")}
          className="btn-primary w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
        >
          <MessageCircle size={18} />
          Open WhatsApp
        </button>
      </div>
    );
  }

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(61,240,90,0.15)",
    borderRadius: "10px",
    padding: "12px 14px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-3 mb-4">
        <input
          type="text"
          placeholder="Your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "rgba(61,240,90,0.5)")}
          onBlur={(e)  => (e.target.style.borderColor = "rgba(61,240,90,0.15)")}
          autoComplete="name"
        />
        <input
          type="tel"
          placeholder="WhatsApp number (required)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "rgba(61,240,90,0.5)")}
          onBlur={(e)  => (e.target.style.borderColor = "rgba(61,240,90,0.15)")}
          autoComplete="tel"
        />
        <input
          type="email"
          placeholder="Email address (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "rgba(61,240,90,0.5)")}
          onBlur={(e)  => (e.target.style.borderColor = "rgba(61,240,90,0.15)")}
          autoComplete="email"
        />
      </div>

      {error && (
        <p className="text-xs mb-3 text-center" style={{ color: "#f87171" }}>
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-4 rounded-xl text-base font-bold flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <MessageCircle size={20} />
          )}
          <span>{loading ? "Saving…" : "Order via WhatsApp"}</span>
        </button>
        <a
          href="tel:+919999999999"
          className="btn-outline w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2"
        >
          <Phone size={16} />
          <span>Call to Order</span>
        </a>
      </div>

      <p className="text-center text-xs mt-4" style={{ color: "#4b5563" }}>
        Your details are safe and never shared.
      </p>
    </form>
  );
}
