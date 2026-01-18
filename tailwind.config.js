/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Customizing the prose plugin to allow for dynamic font sizes
      typography: {
        DEFAULT: {
          css: {
            // Disable default font size from prose, allowing inheritance or inline styles
            'font-size': 'inherit', 
            'p': {
              'font-size': 'inherit',
            },
            'h1': {
              'font-size': '1.5em', // Keep relative sizing for headings
            },
            'h2': {
              'font-size': '1.3em',
            },
            'h3': {
              'font-size': '1.1em',
            },
            // Add other elements as needed
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
