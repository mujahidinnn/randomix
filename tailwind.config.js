/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:      ['Inter', 'system-ui', 'sans-serif'],
        montserrat:['Montserrat', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg:       '#0a0e1a',
        surface:  '#111827',
        surface2: '#1a2235',
        surface3: '#1f2d44',
        border:   '#1e2d45',
        text:     '#f0f4ff',
        muted:    '#7a8aaa',
        blue:     '#00c6ff',
        green:    '#00ff88',
        accent2:  '#0072ff',
        newbie:   '#4ade80',
        middle:   '#facc15',
        pro:      '#f87171',
      },
      backgroundImage: {
        grad: 'linear-gradient(135deg, #00c6ff, #00ff88)',
      },
    },
  },
  plugins: [],
};
