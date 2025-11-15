import forms from '@tailwindcss/forms';
import scrollbarHide from 'tailwind-scrollbar-hide';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        sidebar: '#0d0f12',
        panel: '#111418',
        outline: '#1b1f26',
        accent: '#7c3aed'
      },
      boxShadow: {
        panel: '0 0 0 1px #1b1f26'
      }
    }
  },
  plugins: [
    forms,
    scrollbarHide
  ],
}
