"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard, Phone } from "lucide-react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, any>) => { open(): void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) { resolve(true); return; }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function LeadForm() {
  const router = useRouter();
  const [name,  setName]  = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    loadRazorpayScript().then(setScriptReady);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) { setError("Please enter your full name."); return; }
    if (!phone.trim()) { setError("Please enter your WhatsApp number."); return; }
    if (!/^\+?[0-9]{7,15}$/.test(phone.replace(/\s/g, ""))) {
      setError("Please enter a valid phone number."); return;
    }
    if (!scriptReady) { setError("Payment gateway loading. Please try again in a moment."); return; }

    setLoading(true);
    try {
      // 1. Create Razorpay order (also saves lead to Supabase)
      const orderRes = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), email: email.trim() }),
      });

      if (!orderRes.ok) {
        const data = await orderRes.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to create payment order");
      }

      const orderData = await orderRes.json();

      // 2. Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "WealthWave",
        description: "Personalised Chaldean Numerology Report",
        image: "/icon.png",
        order_id: orderData.razorpay_order_id,
        prefill: {
          name: name.trim(),
          contact: phone.trim(),
          email: email.trim(),
        },
        notes: {
          lead_id: orderData.lead_id,
          order_id: orderData.order_id,
        },
        theme: { color: "#3df05a" },
        modal: {
          ondismiss: () => setLoading(false),
        },
        handler: (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          // Payment success — redirect to thank-you page
          router.push(
            `/thank-you?payment_id=${response.razorpay_payment_id}&order_id=${response.razorpay_order_id}&name=${encodeURIComponent(name.trim())}`
          );
        },
      });

      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
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
          placeholder="Your full name (required)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
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
            <CreditCard size={20} />
          )}
          <span>{loading ? "Processing…" : "Pay ₹999 — Order Now"}</span>
        </button>
        <a
          href="tel:+919999999999"
          className="btn-outline w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2"
        >
          <Phone size={16} />
          <span>Call to Order</span>
        </a>
      </div>

      <div className="flex items-center justify-center gap-3 mt-4">
        <span className="text-xs" style={{ color: "#4b5563" }}>🔒 Secured by</span>
        <span className="text-xs font-semibold" style={{ color: "#6b7280" }}>Razorpay</span>
        <span className="text-xs" style={{ color: "#4b5563" }}>· UPI · Cards · Net Banking</span>
      </div>
    </form>
  );
}
