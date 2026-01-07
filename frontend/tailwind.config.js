/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        'primary': {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
          dark: '#047857',
        },
        'secondary': {
          DEFAULT: '#0EA5E9',
          light: '#E0F2FE',
          dark: '#0284C7',
        },
        'accent': {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          dark: '#D97706',
        },
        // Legacy colors (kept for backward compatibility)
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
        // Stat colors (matching CSS variables)
        'stat-thirst': '#3B82F6',
        'stat-hunger': '#F97316',
        'stat-happiness': '#FBBF24',
        'stat-cleanliness': '#EC4899',
        // Semantic colors
        'success': '#22C55E',
        'error': '#EF4444',
        'warning': '#F59E0B',
        'info': '#3B82F6',
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
        'glow': '0 0 20px rgba(16, 185, 129, 0.3)',
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
