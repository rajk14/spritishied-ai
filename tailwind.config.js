/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FF5722",
        secondary: "#2196F3",
        background: "#0A0A0A",
        card: "#121212",
        muted: "#2A2A2A",
      },
    },
  },
  plugins: [],
}
