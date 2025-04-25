/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
	  "./pages/**/*.{js,jsx,ts,tsx}",
	  "./Auth/**/*.{js,jsx,ts,tsx}",
	  "./bdashboard/**/*.{js,jsx,ts,tsx}",
	  "./Campaigns/**/*.{js,jsx,ts,tsx}",
	  "./Charts/**/*.{js,jsx,ts,tsx}",
	  "./Components/**/*.{js,jsx,ts,tsx}",
	  "./app/**/*.{js,jsx,ts,tsx}",
	  "./src/**/*.{js,jsx,ts,tsx}",
	  "*.{js,ts,jsx,tsx,mdx}",
	],
	prefix: "",
	theme: {
	  container: {
		center: true,
		padding: "1.5rem",
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
		  brand: {
			50: "#f0f7ff",
			100: "#e0eeff",
			200: "#bddcff",
			300: "#84c1ff",
			400: "#4aa3ff",
			500: "#2185ff", // New vibrant brand color
			600: "#0b6efd",
			700: "#0252d4",
			800: "#0544ad",
			900: "#083a8e",
			950: "#05245d",
		  },
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
		  success: {
			DEFAULT: "hsl(142, 76%, 36%)",
			foreground: "hsl(0, 0%, 100%)",
		  },
		  warning: {
			DEFAULT: "hsl(38, 92%, 50%)",
			foreground: "hsl(0, 0%, 100%)",
		  },
		  info: {
			DEFAULT: "hsl(214, 100%, 60%)",
			foreground: "hsl(0, 0%, 100%)",
		  },
		},
		borderRadius: {
		  lg: "var(--radius)",
		  md: "calc(var(--radius) - 2px)",
		  sm: "calc(var(--radius) - 4px)",
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
		  "gradient-flow": {
			"0%, 100%": { backgroundPosition: "0% 50%" },
			"50%": { backgroundPosition: "100% 50%" },
		  },
		  float: {
			"0%, 100%": { transform: "translateY(0)" },
			"50%": { transform: "translateY(-5px)" },
		  },
		  "pulse-soft": {
			"0%, 100%": { opacity: 1 },
			"50%": { opacity: 0.8 },
		  },
		  shimmer: {
			"0%": { backgroundPosition: "-1000px 0" },
			"100%": { backgroundPosition: "1000px 0" },
		  },
		  scale: {
			"0%, 100%": { transform: "scale(1)" },
			"50%": { transform: "scale(1.05)" },
		  },
		  "fade-in": {
			"0%": { opacity: 0 },
			"100%": { opacity: 1 },
		  },
		  "slide-up": {
			"0%": { transform: "translateY(10px)", opacity: 0 },
			"100%": { transform: "translateY(0)", opacity: 1 },
		  },
		  "slide-down": {
			"0%": { transform: "translateY(-10px)", opacity: 0 },
			"100%": { transform: "translateY(0)", opacity: 1 },
		  },
		},
		animation: {
		  "accordion-down": "accordion-down 0.2s ease-out",
		  "accordion-up": "accordion-up 0.2s ease-out",
		  "gradient-flow": "gradient-flow 8s ease infinite",
		  float: "float 3s ease-in-out infinite",
		  "pulse-soft": "pulse-soft 3s ease-in-out infinite",
		  shimmer: "shimmer 2s linear infinite",
		  scale: "scale 3s ease-in-out infinite",
		  "fade-in": "fade-in 0.3s ease-out",
		  "slide-up": "slide-up 0.3s ease-out",
		  "slide-down": "slide-down 0.3s ease-out",
		},
		boxShadow: {
		  glow: "0 0 20px -5px hsl(var(--primary))",
		  "glow-lg": "0 0 35px -5px hsl(var(--primary))",
		  glass: "0 4px 24px 0 rgba(0, 0, 0, 0.05)",
		  "glass-dark": "0 4px 24px 0 rgba(0, 0, 0, 0.25)",
		  subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
		  elevated: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
		},
		backdropBlur: {
		  xs: "2px",
		  sm: "4px",
		  md: "8px",
		  lg: "12px",
		  xl: "16px",
		},
	  },
	},
	plugins: [
	  require("tailwindcss-animate"),
	  require("@tailwindcss/typography")
	]
  }
  