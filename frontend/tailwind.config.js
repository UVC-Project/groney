/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        // Primary colors for student interface
        'sky-blue': {
          DEFAULT: '#87CEEB',
          light: '#B0E0F6',
          dark: '#5FA8D3',
        },
        'grass-green': {
          DEFAULT: '#7CFC00',
          light: '#A3FF4D',
          dark: '#5CB300',
        },
        'sunshine-yellow': {
          DEFAULT: '#FFD700',
          light: '#FFE44D',
          dark: '#CCB000',
        },
        'earth-brown': {
          DEFAULT: '#8B4513',
          light: '#A0522D',
          dark: '#654321',
        },
        'flower-pink': {
          DEFAULT: '#FF69B4',
          light: '#FF8DC7',
          dark: '#E75480',
        },
        // Stat colors
        'stat-thirst': '#4A90E2',
        'stat-hunger': '#F5A623',
        'stat-happiness': '#FFD700',
        'stat-cleanliness': '#7ED321',
        // UI colors
        'success': '#7ED321',
        'error': '#D0021B',
        'warning': '#F5A623',
        'info': '#4A90E2',
      },
      fontFamily: {
        student: ['Fredoka', 'sans-serif'],
        teacher: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'game': '1.5rem',
        'card': '1rem',
      },
      boxShadow: {
        'game': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'game-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      minHeight: {
        'touch-target': '48px',
      },
      minWidth: {
        'touch-target': '48px',
      },
    },
  },
  plugins: [],
};
