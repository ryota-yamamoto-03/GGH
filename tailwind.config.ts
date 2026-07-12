import type { Config } from "tailwindcss";

/**
 * GGH デザインシステム
 * 世界観: 近未来 × ゲームUI / 白 × 水色 × 青
 * - Apple のようなシンプルさ(余白・階層)
 * - Discord のような見やすさ(コントラスト・ダークモード)
 * - Nintendo の親しみやすさ(丸み・アニメーション)
 */
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // ゲームUI用アクセントカラー
        game: {
          cyan: "#22d3ee",
          blue: "#3b82f6",
          deep: "#1e40af",
          glow: "#67e8f9",
        },
        // レベルランクカラー
        rank: {
          rookie: "#94a3b8",
          bronze: "#d97706",
          silver: "#9ca3af",
          gold: "#eab308",
          platinum: "#67e8f9",
          diamond: "#818cf8",
          legend: "#f472b6",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // ゲームUI用アニメーション
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 12px rgba(34, 211, 238, 0.35)" },
          "50%": { boxShadow: "0 0 28px rgba(34, 211, 238, 0.65)" },
        },
        "shine": {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "pop-in": {
          "0%": { transform: "scale(0.85)", opacity: "0" },
          "70%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "sparkle": {
          "0%, 100%": { opacity: "0.4", transform: "scale(0.9)" },
          "50%": { opacity: "1", transform: "scale(1.15)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 3s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2.4s ease-in-out infinite",
        shine: "shine 3s linear infinite",
        "pop-in": "pop-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        sparkle: "sparkle 1.8s ease-in-out infinite",
      },
      backgroundImage: {
        "game-gradient":
          "linear-gradient(135deg, hsl(199 89% 48%) 0%, hsl(221 83% 53%) 100%)",
        "shine-gradient":
          "linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
