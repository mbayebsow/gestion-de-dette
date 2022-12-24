tailwind.config = {
  theme: {
    extend: { fontFamily: { inter: "Inter" } },
    colors: {
      black: "#000",
      white: "#fff",
      green: "#40c800",
      orange: { "100": "#ff9900", "200": "#ff8a00" },
      teal: "#00c2ff",
      red: { "100": "#f71818", "200": "#ff0000" },
      gray: "#9a9a9a",
    },
    fontSize: { base: "10px", lg: "12px", xl: "15px", "2xl": "24px" },
  },
  corePlugins: { preflight: false },
}