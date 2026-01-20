/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';
import forms from '@tailwindcss/forms';
import aspectRatio from '@tailwindcss/aspect-ratio';
import containerQueries from '@tailwindcss/container-queries';

export default {

  content: [
    "./src/**/*.{html,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        principal_mc: '#FCE2E4',
        principal_c: '#F5ADAB',
        principal: '#E2746E',
        principal_f: '#BB4433',
        principal_mf: '#781005',
      },
    },
  },
  plugins: [
    typography,
    forms,
    aspectRatio,
    containerQueries,
  ],
};
