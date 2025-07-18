/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}', // Busca clases en el directorio pages
    './components/**/*.{js,ts,jsx,tsx,mdx}', // Busca clases en el directorio components (si tienes uno)
    './public/**/*.html', // Si tienes archivos HTML estáticos en public
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
