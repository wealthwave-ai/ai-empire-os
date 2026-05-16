"use client";

import { useState } from "react";
import {
  Star,
  Sparkles,
  ArrowRight,
  Check,
  ChevronDown,
  Zap,
  Shield,
  Clock,
  TrendingUp,
} from "lucide-react";
import { calculateChaldeanNumber, getNumerologyMeaning } from "@/lib/utils";
import LeadForm from "@/components/LeadForm";

const PRICE = 999;

const NAV_LINKS = [
  { label: "Report", href: "#report" },
  { label: "Features", href: "#features" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
];

const REPORT_SECTIONS = [
  {
    icon: "🔢",
    title: "Core Number (Moolank)",
    desc: "Your primary number derived from your date of birth — the foundation of your personality and life path.",
  },
  {
    icon: "✍️",
    title: "Name Number Report",
    desc: "A Chaldean letter-by-letter analysis of your name, revealing the vibrational frequency it carries.",
  },
  {
    icon: "💼",
    title: "Business Name Analysis",
    desc: "Is your company, shop, or brand name numerologically aligned for success? We check and advise.",
  },
  {
    icon: "💰",
    title: "Wealth Yogas",
    desc: "Hidden wealth combinations in your chart and practical steps to activate your financial potential.",
  },
  {
    icon: "🏠",
    title: "Home & Mobile Number",
    desc: "How auspicious is your house number and mobile number — a detailed breakdown with remedies.",
  },
  {
    icon: "💎",
    title: "Lucky Gems & Colors",
    desc: "Gemstones, colors, and days aligned to your personal number for consistent positive energy.",
  },
  {
    icon: "📅",
    title: "Year Forecast 2025–26",
    desc: "What lies ahead in business, relationships, health, and family — a forward-looking yearly outlook.",
  },
  {
    icon: "🔧",
    title: "Name Correction Advice",
    desc: "If your name is misaligned, we guide you on precise spelling corrections to shift your energy.",
  },
];

const FEATURES = [
  {
    icon: <Zap size={20} />,
    title: "Delivered Within 24 Hours",
    desc: "Your personalised report is sent as a PDF to your WhatsApp and email within 24 hours of ordering.",
  },
  {
    icon: <Shield size={20} />,
    title: "100% Personalised",
    desc: "Every report is handcrafted for your specific name and date of birth — never a generic template.",
  },
  {
    icon: <Clock size={20} />,
    title: "15+ Years of Practice",
    desc: "Rekha Verma ji has been a dedicated Chaldean numerologist for over 15 years, guiding thousands of families.",
  },
  {
    icon: <TrendingUp size={20} />,
    title: "5,000+ Happy Clients",
    desc: "Families across India and abroad have transformed their careers, businesses, and relationships.",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    city: "Delhi",
    rating: 5,
    // The one Hindi testimonial
    text: "Rekha ji ने मुझे नाम में एक अक्षर बदलने की सलाह दी। तीन महीने में व्यापार दोगुना हो गया। इतनी छोटी-सी बात का इतना बड़ा असर — अविश्वसनीय! 🙏",
    initial: "P",
    isHindi: true,
  },
  {
    name: "Rajan Mehta",
    city: "Dubai",
    rating: 5,
    text: "I was skeptical going in. But every insight in the report turned out to be accurate. I changed my business name based on Rekha ji's advice — revenue went up 40% within the quarter. Genuinely life-changing.",
    initial: "R",
    isHindi: false,
  },
  {
    name: "Sunita Kapoor",
    city: "London",
    rating: 5,
    text: "My daughter was stuck in her career for two years. Rekha ji's analysis pinpointed exactly why — and the name correction she suggested shifted everything. We're deeply grateful.",
    initial: "S",
    isHindi: false,
  },
  {
    name: "Vikram Singh",
    city: "Bengaluru",
    rating: 5,
    text: "₹999 for a 30-page personalised report — I expected a few generic lines. What I got felt like it was written specifically for me. The wealth yogas section alone was worth 10x the price.",
    initial: "V",
    isHindi: false,
  },
];

const FAQS = [
  {
    q: "What is Chaldean Numerology?",
    a: "Chaldean Numerology is the world's oldest and most precise numerology system, rooted in 3,000-year-old Babylonian wisdom. Each letter is assigned a value from 1–8 (9 is considered sacred and excluded). It is widely regarded as more accurate than the Pythagorean method used in Western numerology.",
  },
  {
    q: "How soon will I receive my report?",
    a: "Within 24 hours of receiving your details and payment confirmation, your complete report is delivered as a PDF to both your WhatsApp and email.",
  },
  {
    q: "What information do I need to provide?",
    a: "Just four things: (1) your full name as it appears on your birth certificate, (2) your date of birth, (3) time of birth if known, and (4) the area you want guidance on — career, business, relationships, or general life direction.",
  },
  {
    q: "Is the report available in English?",
    a: "Yes. Reports are available in both English and Hindi. Simply mention your preferred language when you place your order.",
  },
  {
    q: "How do I make the payment?",
    a: "You can pay via UPI (GPay, PhonePe, Paytm), Net Banking, or Debit/Credit Card. After payment, send the confirmation screenshot on WhatsApp along with your details and we'll begin immediately.",
  },
];

function NumberOrb({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="w-16 h-16 rounded-full border-2 flex items-center justify-center text-2xl font-bold number-glow"
        style={{
          borderColor: "rgba(61,240,90,0.5)",
          background: "radial-gradient(circle, rgba(61,240,90,0.12) 0%, transparent 70%)",
          color: "#3df05a",
          fontFamily: "var(--font-cinzel)",
        }}
      >
        {number}
      </div>
      <span className="text-xs text-gray-500 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={14} fill="#f5c842" color="#f5c842" />
      ))}
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border-b cursor-pointer"
      style={{ borderColor: "rgba(61,240,90,0.1)" }}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between py-5 gap-4">
        <p className="font-medium text-white text-sm md:text-base">{q}</p>
        <ChevronDown
          size={18}
          className="flex-shrink-0 transition-transform duration-300"
          style={{
            color: "#3df05a",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </div>
      {open && (
        <p className="pb-5 text-sm leading-relaxed" style={{ color: "#9ca3af" }}>
          {a}
        </p>
      )}
    </div>
  );
}

function NumerologyCalculator() {
  const [name, setName] = useState("");
  const [result, setResult] = useState<{ number: number; meaning: string } | null>(null);

  const calculate = () => {
    if (!name.trim()) return;
    const number = calculateChaldeanNumber(name);
    const meaning = getNumerologyMeaning(number);
    setResult({ number, meaning });
  };

  return (
    <div
      className="card-glass rounded-2xl p-8 max-w-lg mx-auto"
      style={{ border: "1px solid rgba(61,240,90,0.15)" }}
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-3">
          <Sparkles size={16} style={{ color: "#3df05a" }} />
          <span className="text-xs uppercase tracking-widest" style={{ color: "#3df05a" }}>
            Free Preview
          </span>
        </div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ fontFamily: "var(--font-cinzel)", color: "#fff" }}
        >
          Find Your Name Number
        </h3>
        <p className="text-sm" style={{ color: "#6b7280" }}>
          Calculated instantly using the Chaldean method — completely free
        </p>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && calculate()}
          placeholder="Type your full name in English..."
          className="flex-1 px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(61,240,90,0.15)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(61,240,90,0.4)")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(61,240,90,0.15)")}
        />
        <button
          onClick={calculate}
          className="btn-primary px-5 py-3 rounded-xl text-sm font-bold flex-shrink-0"
        >
          Calculate
        </button>
      </div>

      {result && (
        <div
          className="mt-6 p-5 rounded-xl text-center"
          style={{
            background: "rgba(61,240,90,0.05)",
            border: "1px solid rgba(61,240,90,0.2)",
          }}
        >
          <div
            className="text-6xl font-black number-glow mb-3"
            style={{ fontFamily: "var(--font-cinzel)", color: "#3df05a" }}
          >
            {result.number}
          </div>
          <p className="text-sm font-medium text-white mb-1">Your Chaldean Name Number</p>
          <p className="text-xs leading-relaxed" style={{ color: "#9ca3af" }}>
            {result.meaning}
          </p>
          <p className="text-xs mt-4" style={{ color: "#6b7280" }}>
            This is a preview. Your full report includes 30+ pages of in-depth analysis.
          </p>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#07070a" }}>
      {/* ─── Navbar ─── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
        style={{
          background: "rgba(7,7,10,0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(61,240,90,0.08)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
            style={{
              background: "linear-gradient(135deg, #3df05a, #22c93b)",
              color: "#07070a",
              fontFamily: "var(--font-cinzel)",
            }}
          >
            E
          </div>
          <div>
            <span
              className="font-bold text-sm tracking-wide"
              style={{ fontFamily: "var(--font-cinzel)", color: "#fff" }}
            >
              Empire OS
            </span>
            <span className="hidden md:block text-xs" style={{ color: "#6b7280" }}>
              by Rekha Verma Anka
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm transition-colors hover:text-white"
              style={{ color: "#6b7280" }}
            >
              {link.label}
            </a>
          ))}
        </div>

        <a
          href="#order"
          className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"
        >
          <span>Order Now</span>
          <ArrowRight size={15} />
        </a>
      </nav>

      {/* ─── Hero ─── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 grid-bg"
        style={{ backgroundColor: "#07070a" }}
      >
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(61,240,90,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Floating number orbs */}
        <div className="absolute top-32 left-8 md:left-24 float opacity-30">
          <NumberOrb number="8" label="Saturn" />
        </div>
        <div className="absolute top-40 right-8 md:right-24 float opacity-30" style={{ animationDelay: "2s" }}>
          <NumberOrb number="3" label="Jupiter" />
        </div>
        <div className="absolute bottom-32 left-12 md:left-36 float opacity-20" style={{ animationDelay: "4s" }}>
          <NumberOrb number="6" label="Venus" />
        </div>
        <div className="absolute bottom-40 right-12 md:right-36 float opacity-20" style={{ animationDelay: "1s" }}>
          <NumberOrb number="1" label="Sun" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 fade-in-up"
            style={{
              background: "rgba(61,240,90,0.08)",
              border: "1px solid rgba(61,240,90,0.2)",
            }}
          >
            <Sparkles size={14} style={{ color: "#3df05a" }} />
            <span className="text-xs font-medium tracking-widest uppercase" style={{ color: "#3df05a" }}>
              Rekha Verma Anka — Chaldean Numerology Expert
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-5 fade-in-up fade-in-up-delay-1"
            style={{ fontFamily: "var(--font-cinzel)", color: "#fff" }}
          >
            Discover the Power
            <br />
            of Your{" "}
            <span className="text-gradient-green">Name</span>
          </h1>

          {/* Hindi subtitle — intentional cultural element */}
          <p
            className="text-base md:text-lg italic mb-5 fade-in-up fade-in-up-delay-2"
            style={{ color: "#3df05a", fontFamily: "'Noto Sans Devanagari', sans-serif", opacity: 0.9 }}
          >
            Rekha Verma ji ke saath apna ank jaanein
          </p>

          <p
            className="text-lg md:text-xl leading-relaxed mb-4 max-w-2xl mx-auto fade-in-up fade-in-up-delay-3"
            style={{ color: "#9ca3af" }}
          >
            Ancient Chaldean wisdom reveals whether your name, house number, and
            business name are working for you — or quietly holding you back.
          </p>

          <p
            className="text-sm mb-10 font-medium fade-in-up fade-in-up-delay-3"
            style={{ color: "#6b7280" }}
          >
            5,000+ families helped across India and abroad
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 fade-in-up fade-in-up-delay-4">
            <a
              href="#order"
              className="btn-primary w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold flex items-center justify-center gap-3 glow-pulse"
            >
              <span>Get Your Report — Only ₹{PRICE}</span>
              <ArrowRight size={18} />
            </a>
            <a
              href="#calculator"
              className="btn-outline w-full sm:w-auto px-8 py-4 rounded-xl text-base flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              <span>Try Free Calculator</span>
            </a>
          </div>

          {/* Social proof bar */}
          <div
            className="flex flex-wrap items-center justify-center gap-6 mt-12 pt-8 fade-in-up fade-in-up-delay-5"
            style={{ borderTop: "1px solid rgba(61,240,90,0.08)" }}
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black" style={{ color: "#3df05a", fontFamily: "var(--font-cinzel)" }}>5,000+</span>
              <span className="text-xs" style={{ color: "#6b7280" }}>Happy Clients</span>
            </div>
            <div className="w-px h-8 hidden sm:block" style={{ background: "rgba(61,240,90,0.15)" }} />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black" style={{ color: "#3df05a", fontFamily: "var(--font-cinzel)" }}>15+</span>
              <span className="text-xs" style={{ color: "#6b7280" }}>Years Experience</span>
            </div>
            <div className="w-px h-8 hidden sm:block" style={{ background: "rgba(61,240,90,0.15)" }} />
            <div className="flex flex-col items-center">
              <div className="flex gap-0.5 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill="#f5c842" color="#f5c842" />
                ))}
              </div>
              <span className="text-xs" style={{ color: "#6b7280" }}>4.9 / 5 Rating</span>
            </div>
            <div className="w-px h-8 hidden sm:block" style={{ background: "rgba(61,240,90,0.15)" }} />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black" style={{ color: "#3df05a", fontFamily: "var(--font-cinzel)" }}>24 hr</span>
              <span className="text-xs" style={{ color: "#6b7280" }}>Report Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Free Calculator ─── */}
      <section id="calculator" className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <span
            className="text-xs uppercase tracking-widest font-medium block mb-3"
            style={{ color: "#3df05a" }}
          >
            Try It Free
          </span>
          <h2
            className="text-3xl md:text-4xl font-black mb-4"
            style={{ fontFamily: "var(--font-cinzel)", color: "#fff" }}
          >
            Calculate Your{" "}
            <span className="text-gradient-green">Name Number</span>
          </h2>
          <p className="text-sm" style={{ color: "#6b7280" }}>
            Free. No registration required.
          </p>
        </div>
        <NumerologyCalculator />
      </section>

      {/* ─── Report Sections ─── */}
      <section id="report" className="py-20 px-6" style={{ backgroundColor: "#0a0a0e" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span
              className="text-xs uppercase tracking-widest font-medium block mb-3"
              style={{ color: "#3df05a" }}
            >
              What You Get
            </span>
            <h2
              className="text-3xl md:text-4xl font-black mb-4"
              style={{ fontFamily: "var(--font-cinzel)", color: "#fff" }}
            >
              Inside Your Report
            </h2>
            <p className="text-sm max-w-lg mx-auto" style={{ color: "#6b7280" }}>
              A 30+ page personalised document covering every dimension of your numerological profile
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {REPORT_SECTIONS.map((item, i) => (
              <div
                key={i}
                className="card-glass rounded-xl p-6 transition-all duration-300 cursor-default"
                style={{ borderColor: "rgba(61,240,90,0.1)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(61,240,90,0.3)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px rgba(61,240,90,0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(61,240,90,0.1)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-white mb-2 text-sm">{item.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "#6b7280" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span
              className="text-xs uppercase tracking-widest font-medium block mb-3"
              style={{ color: "#3df05a" }}
            >
              Why Choose Us
            </span>
            <h2
              className="text-3xl md:text-4xl font-black"
              style={{ fontFamily: "var(--font-cinzel)", color: "#fff" }}
            >
              What Sets Us Apart
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="flex gap-5 p-6 rounded-xl card-glass"
                style={{ border: "1px solid rgba(61,240,90,0.08)" }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(61,240,90,0.1)", color: "#3df05a" }}
                >
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1.5 text-sm">{f.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "#6b7280" }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section id="testimonials" className="py-20 px-6" style={{ backgroundColor: "#0a0a0e" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span
              className="text-xs uppercase tracking-widest font-medium block mb-3"
              style={{ color: "#3df05a" }}
            >
              Real Stories
            </span>
            <h2
              className="text-3xl md:text-4xl font-black"
              style={{ fontFamily: "var(--font-cinzel)", color: "#fff" }}
            >
              Real Stories,{" "}
              <span className="text-gradient-green">Real Transformations</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="card-glass rounded-2xl p-6"
                style={{ border: "1px solid rgba(61,240,90,0.1)" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <StarRating count={t.rating} />
                  {t.isHindi && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(61,240,90,0.08)",
                        color: "#3df05a",
                        border: "1px solid rgba(61,240,90,0.15)",
                      }}
                    >
                      हिंदी
                    </span>
                  )}
                </div>
                <p
                  className="text-sm leading-relaxed my-4"
                  style={{
                    color: "#d1d5db",
                    fontFamily: t.isHindi ? "'Noto Sans Devanagari', sans-serif" : "inherit",
                    lineHeight: t.isHindi ? "1.8" : "1.6",
                  }}
                >
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: "rgba(61,240,90,0.15)", color: "#3df05a" }}
                  >
                    {t.initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs" style={{ color: "#6b7280" }}>
                      {t.city}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing / Order ─── */}
      <section id="order" className="py-24 px-6 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(61,240,90,0.06) 0%, transparent 70%)",
          }}
        />
        <div className="max-w-lg mx-auto relative z-10">
          <div className="text-center mb-10">
            <span
              className="text-xs uppercase tracking-widest font-medium block mb-3"
              style={{ color: "#3df05a" }}
            >
              Get Started
            </span>
            <h2
              className="text-3xl md:text-4xl font-black mb-4"
              style={{ fontFamily: "var(--font-cinzel)", color: "#fff" }}
            >
              Order Your Report
            </h2>
            <p className="text-sm" style={{ color: "#6b7280" }}>
              A one-time investment for a lifetime of clarity
            </p>
          </div>

          <div
            className="rounded-2xl p-8 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0d0d11 0%, #111117 100%)",
              border: "1px solid rgba(61,240,90,0.25)",
              boxShadow: "0 0 60px rgba(61,240,90,0.1)",
            }}
          >
            {/* Popular badge */}
            <div
              className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: "rgba(61,240,90,0.15)",
                color: "#3df05a",
                border: "1px solid rgba(61,240,90,0.3)",
              }}
            >
              Most Popular
            </div>

            {/* Price */}
            <div className="text-center mb-8">
              <div className="flex items-start justify-center gap-1 mb-2">
                <span className="text-xl mt-3 font-bold" style={{ color: "#9ca3af" }}>₹</span>
                <span
                  className="text-7xl font-black number-glow"
                  style={{ fontFamily: "var(--font-cinzel)", color: "#3df05a" }}
                >
                  {PRICE}
                </span>
              </div>
              <p className="text-xs" style={{ color: "#6b7280" }}>
                One-time payment · No hidden charges
              </p>
              <div
                className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full"
                style={{ background: "rgba(245,200,66,0.08)", border: "1px solid rgba(245,200,66,0.2)" }}
              >
                <span className="text-xs line-through" style={{ color: "#6b7280" }}>₹1,999</span>
                <span className="text-xs font-bold" style={{ color: "#f5c842" }}>50% OFF — Limited Time</span>
              </div>
            </div>

            {/* Includes */}
            <ul className="space-y-3 mb-8">
              {[
                "30+ Page Personalised Numerology Report",
                "Chaldean Name Number Analysis",
                "Core Number & Destiny Number Calculation",
                "Business Name Compatibility Check",
                "Lucky Colors, Gemstones & Days",
                "2025–2026 Year Forecast",
                "Name Correction Recommendations",
                "PDF Delivery via WhatsApp & Email in 24 hrs",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "rgba(61,240,90,0.15)" }}
                  >
                    <Check size={11} style={{ color: "#3df05a" }} />
                  </div>
                  <span style={{ color: "#d1d5db" }}>{item}</span>
                </li>
              ))}
            </ul>

            {/* Lead capture form — saves to Supabase then opens WhatsApp */}
            <LeadForm />
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-20 px-6" style={{ backgroundColor: "#0a0a0e" }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <span
              className="text-xs uppercase tracking-widest font-medium block mb-3"
              style={{ color: "#3df05a" }}
            >
              FAQ
            </span>
            <h2
              className="text-3xl md:text-4xl font-black"
              style={{ fontFamily: "var(--font-cinzel)", color: "#fff" }}
            >
              Frequently Asked Questions
            </h2>
          </div>
          <div>
            {FAQS.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA Banner ─── */}
      <section
        className="py-20 px-6 text-center relative overflow-hidden"
        style={{ backgroundColor: "#07070a" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(61,240,90,0.07) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-5xl mb-6">🔢</p>
          <h2
            className="text-3xl md:text-5xl font-black mb-4"
            style={{ fontFamily: "var(--font-cinzel)", color: "#fff" }}
          >
            Your Number Is Your{" "}
            <span className="text-gradient-green">Destiny</span>
          </h2>
          <p className="text-base mb-10" style={{ color: "#6b7280" }}>
            Every day with a misaligned name is a day of lost potential. Start your journey today.
          </p>
          <a
            href="#order"
            className="btn-primary inline-flex items-center gap-3 px-10 py-4 rounded-xl text-base font-bold glow-pulse"
          >
            <span>Get Your Report — ₹{PRICE}</span>
            <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer
        className="px-6 py-10 text-center"
        style={{ borderTop: "1px solid rgba(61,240,90,0.06)" }}
      >
        <div
          className="flex items-center justify-center gap-2 mb-4"
          style={{ fontFamily: "var(--font-cinzel)" }}
        >
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-xs font-black"
            style={{ background: "linear-gradient(135deg, #3df05a, #22c93b)", color: "#07070a" }}
          >
            E
          </div>
          <span className="font-bold text-sm" style={{ color: "#fff" }}>
            Empire OS
          </span>
          <span className="text-xs" style={{ color: "#4b5563" }}>
            by Rekha Verma Anka
          </span>
        </div>
        <p className="text-xs mb-2" style={{ color: "#4b5563" }}>
          WealthWave — Chaldean Numerology &amp; Ankashastra
        </p>
        <p className="text-xs" style={{ color: "#374151" }}>
          © 2025 Rekha Verma Anka. All rights reserved. For guidance purposes only.
        </p>
      </footer>
    </div>
  );
}
