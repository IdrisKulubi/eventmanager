import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'float-delay': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        'float-delay-2': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-25px)' },
        },
        'glow': {
          '0%, 100%': { opacity: 1, filter: 'brightness(1)' },
          '50%': { opacity: 0.6, filter: 'brightness(1.3)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' },
        },
        "sparkle-spin": {
          "0%": { transform: "rotate(0deg) scale(0)", opacity: 0 },
          "50%": { transform: "rotate(180deg) scale(1)", opacity: 1 },
          "100%": { transform: "rotate(360deg) scale(0)", opacity: 0 },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: 0.7 },
          "50%": { opacity: 0.2 },
        },
        "pulse-bright": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
        "rotate": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "rotate-reverse": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(-360deg)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "25%": { transform: "translateY(-12px) rotate(3deg)" },
          "50%": { transform: "translateY(5px) rotate(-3deg)" },
          "75%": { transform: "translateY(-8px) rotate(2deg)" },
        },
        "float-medium": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "25%": { transform: "translateY(-15px) rotate(-2deg)" },
          "50%": { transform: "translateY(8px) rotate(4deg)" },
          "75%": { transform: "translateY(-10px) rotate(-1deg)" },
        },
        "float-fast": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "25%": { transform: "translateY(-10px) rotate(5deg)" },
          "50%": { transform: "translateY(6px) rotate(-5deg)" },
          "75%": { transform: "translateY(-8px) rotate(2deg)" },
        },
        "pulse-medium": {
          "0%, 100%": { opacity: 0.6, transform: "scale(1)" },
          "50%": { opacity: 0.2, transform: "scale(0.95)" },
        },
        "pulse-fast": {
          "0%, 100%": { opacity: 0.5, transform: "scale(0.95)" },
          "50%": { opacity: 0.15, transform: "scale(1.05)" },
        },
        "gradient": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "bounce-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "fadeIn": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        "slideUp": {
          "0%": { transform: "translateY(20px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 6s ease-in-out infinite",
        "float-delay": "float-delay 7s ease-in-out infinite 1s",
        "float-delay-2": "float-delay-2 8s ease-in-out infinite 2s",
        "glow": "glow 4s ease-in-out infinite",
        "shimmer": "shimmer 3s linear infinite",
        "sparkle-spin": "sparkle-spin 1500ms forwards",
        "pulse-slow": "pulse-slow 6s ease-in-out infinite",
        "pulse-bright": "pulse-bright 3s ease-in-out infinite",
        "rotate": "rotate 40s linear infinite",
        "rotate-reverse": "rotate-reverse 30s linear infinite",
        "float-slow": "float-slow 12s ease-in-out infinite",
        "float-medium": "float-medium 10s ease-in-out infinite",
        "float-fast": "float-fast 8s ease-in-out infinite",
        "pulse-medium": "pulse-medium 8s ease-in-out infinite",
        "pulse-fast": "pulse-fast 5s ease-in-out infinite",
        "gradient": "gradient 8s ease infinite",
        "bounce-soft": "bounce-soft 2s ease-in-out infinite",
        "fadeIn": "fadeIn 0.6s ease-in forwards",
        "slideUp": "slideUp 0.7s ease-out forwards",
      },
      backgroundSize: {
        "400": "400% 100%",
        "200": "200% 200%",
      },
      scale: {
        '102': '1.02',
      },
    },
  },
  plugins: [tailwindcssAnimate],
} 