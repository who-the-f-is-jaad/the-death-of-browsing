import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'void':    '#050505',
        'surface': '#0d0d0d',
        'ash':     '#787878',
        'bone':    '#e2e2e2',
        'crimson': '#7a1212',
      },
      fontFamily: {
        // Wordmark only — UnifrakturCook blackletter
        brand: ['"Unifraktur"', '"Pixel3"', 'monospace'],
        // All headings, labels, UI — IM Fell English
        heading: ['"Pixel3"', 'monospace'],
        // Body — IM Fell English
        serif: ['"Pixel3"', 'Georgia', 'Cambria', 'serif'],
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ],
      },
      letterSpacing: {
        ritual: '0.2em',
        wide2:  '0.12em',
      },
    },
  },
  plugins: [],
};

export default config;
