import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:   '#C41E3A',
        accent:    '#2B4A8B',
        surface:   '#FFFFFF',
        bg:        '#F7F3EE',
        border:    '#E8E0D5',
        text:      '#1A1A2E',
        muted:     '#6B6B7B',
        success:   '#2D7D46',
        error:     '#C41E3A',
        warning:   '#D4860A',
      },
    },
  },
  plugins: [],
}

export default config
