/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      borderWidth: {
        3: "3px",
      },
      fontFamily: {
        sans: ["SpaceGrotesk_400Regular"], // Override default sans
        space: ["SpaceGrotesk_400Regular"],
        "space-medium": ["SpaceGrotesk_500Medium"],
        "space-bold": ["SpaceGrotesk_700Bold"],
        "space-light": ["SpaceGrotesk_300Light"],
        "space-semibold": ["SpaceGrotesk_600SemiBold"],
      },
      colors: {
        accent: {
          DEFAULT: "#3B82F6",
          muted: "#1E3A5F",
        },
        surface: {
          DEFAULT: "#0F172A",
          elevated: "#1E293B",
          border: "#334155",
        },
        neoBg: "#ffffff",
        neoBgDark: "#000000",
        neoFg: "#0f172a",
        neoFgDark: "#ffffff",
        neoMain: "#ffffff",
        neoMainDark: "#000000",
        neoCyan: "#818cf8",
        neoCyanDark: "#6366f1",
        neoYellow: "#f59e0b",
        neoYellowDark: "#d97706",
        neoPink: "#10b981",
        neoPinkDark: "#059669",
        neoBlue: "#06b6d4",
        neoBlueDark: "#0891b2",
      },
    },
  },
  plugins: [],
};
