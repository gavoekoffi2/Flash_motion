import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Couleur principale — violet électrique premium
        brand: {
          50:  "#f5f0ff",
          100: "#ede0ff",
          200: "#d8bfff",
          300: "#bf94ff",
          400: "#a855f7",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
        // Accent cyan/electric
        accent: {
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
        },
        // Accent rose/magenta
        rose: {
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
        },
        // Fond sombre profond
        dark: {
          50:  "#f8fafc",
          100: "#e2e8f0",
          200: "#cbd5e1",
          300: "#94a3b8",
          400: "#64748b",
          500: "#475569",
          600: "#334155",
          700: "#1e293b",
          800: "#0f172a",
          900: "#080d1a",
          950: "#030712",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Cal Sans", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-glow": "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139,92,246,0.3), transparent)",
        "card-glow": "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(139,92,246,0.08), transparent)",
        "mesh-gradient": "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #06b6d4 100%)",
      },
      boxShadow: {
        "glow-sm": "0 0 15px rgba(139,92,246,0.3)",
        "glow-md": "0 0 30px rgba(139,92,246,0.4)",
        "glow-lg": "0 0 60px rgba(139,92,246,0.5)",
        "glow-cyan": "0 0 30px rgba(6,182,212,0.4)",
        "glow-rose": "0 0 30px rgba(244,63,94,0.4)",
        "card": "0 4px 24px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
        "card-hover": "0 8px 40px rgba(0,0,0,0.5), 0 0 20px rgba(139,92,246,0.2)",
        "glass": "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        "float-fast": "float 4s ease-in-out infinite",
        "spin-slow": "spin 12s linear infinite",
        "spin-reverse": "spin-reverse 8s linear infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "gradient-shift": "gradient-shift 8s ease infinite",
        "slide-up": "slide-up 0.6s cubic-bezier(0.16,1,0.3,1) forwards",
        "slide-down": "slide-down 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "scale-in": "scale-in 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
        "particle": "particle 15s linear infinite",
        "orbit": "orbit 20s linear infinite",
        "orbit-reverse": "orbit-reverse 15s linear infinite",
        "text-reveal": "text-reveal 0.8s cubic-bezier(0.16,1,0.3,1) forwards",
        "border-spin": "border-spin 4s linear infinite",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "spin-reverse": {
          from: { transform: "rotate(360deg)" },
          to: { transform: "rotate(0deg)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        particle: {
          "0%": { transform: "translateY(100vh) translateX(0) rotate(0deg)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(-100px) translateX(100px) rotate(720deg)", opacity: "0" },
        },
        orbit: {
          "0%": { transform: "rotate(0deg) translateX(120px) rotate(0deg)" },
          "100%": { transform: "rotate(360deg) translateX(120px) rotate(-360deg)" },
        },
        "orbit-reverse": {
          "0%": { transform: "rotate(360deg) translateX(80px) rotate(-360deg)" },
          "100%": { transform: "rotate(0deg) translateX(80px) rotate(0deg)" },
        },
        "text-reveal": {
          "0%": { clipPath: "inset(0 100% 0 0)" },
          "100%": { clipPath: "inset(0 0% 0 0)" },
        },
        "border-spin": {
          "0%": { "--border-angle": "0deg" },
          "100%": { "--border-angle": "360deg" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
