/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        // Core HSL mappings
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        
        // Brand Colors (Synced with your Pink/Violet theme)
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        
        // Tech/Obsidian Accents
        obsidian: '#05070A',
        titanium: '#0E121A',
        
        // UI Components
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px hsla(var(--primary), 0.1)' },
          '50%': { boxShadow: '0 0 40px hsla(var(--primary), 0.25)' },
        },
        'border-pulse': {
          '0%, 100%': { opacity: '0.15' },
          '50%': { opacity: '0.4' },
        },
        glitch: {
          '0%': { clipPath: 'inset(0 0 95% 0)', transform: 'translate(-2px, 0)' },
          '10%': { clipPath: 'inset(40% 0 50% 0)', transform: 'translate(2px, 0)' },
          '20%': { clipPath: 'inset(70% 0 20% 0)', transform: 'translate(-1px, 0)' },
          '30%': { clipPath: 'inset(20% 0 70% 0)', transform: 'translate(1px, 0)' },
          '40%': { clipPath: 'inset(60% 0 30% 0)', transform: 'translate(-2px, 0)' },
          '50%': { clipPath: 'inset(10% 0 80% 0)', transform: 'translate(2px, 0)' },
          '60%': { clipPath: 'inset(80% 0 10% 0)', transform: 'translate(-1px, 0)' },
          '70%': { clipPath: 'inset(30% 0 60% 0)', transform: 'translate(1px, 0)' },
          '80%': { clipPath: 'inset(50% 0 40% 0)', transform: 'translate(-2px, 0)' },
          '90%': { clipPath: 'inset(5% 0 90% 0)', transform: 'translate(2px, 0)' },
          '100%': { clipPath: 'inset(0 0 95% 0)', transform: 'translate(0)' },
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        float: 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'border-pulse': 'border-pulse 4s ease-in-out infinite',
        glitch: 'glitch 0.4s steps(2) infinite',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}