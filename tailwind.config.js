module.exports = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "css-var-tournaments-bg": "var(--tournaments-bg)",
        "bg-lighter": "hsl(237.3deg 42.3% 35.6%)",
      },
    },
  },
  variants: {},
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
