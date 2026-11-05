const path = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Absolute globs keep content detection correct regardless of the invoking cwd.
  content: [path.join(__dirname, "index.html"), path.join(__dirname, "src/**/*.{js,ts,jsx,tsx}")],
  theme: {
    extend: {
      colors: {
        supportDesk: {
          darkBlue: "#0a0a2e",
          lighterBlue: "#1b1b4e",
          accent: "#e94560",
          light: "#f0f2f5",
        },
      },
    },
  },
  plugins: [],
};
