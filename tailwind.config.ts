import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#07070a",
        "accent-green": "#3df05a",
        "card-bg": "#0d0d11",
        "border-subtle": "#1a1a22",
        "text-muted": "#6b7280",
        "text-secondary": "#9ca3af",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-cinzel)", "serif"],
      },
      backgroundImage: {
        "green-glow": "radial-gradient(ellipse at center, rgba(61,240,90,0.15) 0%, transparent 70%)",
        "hero-grid": "linear-gradient(rgba(61,240,90,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(61,240,90,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "60px 60px",
      },
      boxShadow: {
        "green-glow": "0 0 40px rgba(61,240,90,0.2)",
        "green-sm": "0 0 12px rgba(61,240,90,0.15)",
        card: "0 4px 24px rgba(0,0,0,0.6)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
