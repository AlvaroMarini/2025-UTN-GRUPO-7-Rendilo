/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        palette: {
          black: '#0B0A0D',      // fondo muy oscuro
          deep: '#5A588C',       // acento
          mid: '#9A99BF',        // secundario
          light: '#C0BFD9',      // fondo suave / highlights
          dark: '#212340',       // principal oscuro (nav / header)
        },
      },
      backgroundColor: {
        'primary': '#212340',
        'accent': '#5A588C',
        'surface': '#C0BFD9',
        'muted': '#9A99BF',
        'deep': '#0B0A0D',
      },
      textColor: {
        'primary': '#212340',
        'accent': '#5A588C',
        'surface': '#C0BFD9',
        'muted': '#9A99BF',
        'deep': '#0B0A0D',
      },
      borderColor: {
        'primary': '#212340',
        'accent': '#5A588C',
        'surface': '#C0BFD9',
        'muted': '#9A99BF',
        'deep': '#0B0A0D',
      },
    },
  },
  plugins: [],
}
