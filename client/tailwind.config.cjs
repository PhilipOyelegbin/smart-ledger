/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(226,232,240,0.9), 0 24px 80px rgba(37,99,235,0.12)",
      },
      backgroundImage: {
        "radial-soft":
          "radial-gradient(circle at top left, rgba(37, 99, 235, 0.12), transparent 34%), radial-gradient(circle at right, rgba(16, 185, 129, 0.08), transparent 28%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        shimmer: "shimmer 1.8s linear infinite",
      },
    },
  },
  plugins: [],
};
