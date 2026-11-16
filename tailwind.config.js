/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1rem', screens: { '2xl': '1200px' } },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        surface: 'hsl(var(--surface))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        brand: { DEFAULT: '#2563EB', hover: '#1D4ED8', soft: '#EFF6FF' },
        wa: { DEFAULT: '#25D366', dark: '#008069', out: '#D9FDD3', chat: '#EFEAE2', tick: '#53BDEB' },
        imsg: { DEFAULT: '#007AFF', in: '#E9E9EB' },
        sms: { DEFAULT: '#34C759', in: '#E9E9EB' },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        bounce3: { '0%,80%,100%': { transform: 'translateY(0)', opacity: '.4' }, '40%': { transform: 'translateY(-3px)', opacity: '1' } },
        ping2: { '0%': { transform: 'scale(1)', opacity: '.6' }, '100%': { transform: 'scale(2.2)', opacity: '0' } },
        eq: { '0%,100%': { height: '4px' }, '50%': { height: '12px' } },
        radar: { '0%': { transform: 'scale(1)', opacity: '.8' }, '100%': { transform: 'scale(1.6)', opacity: '0' } },
        'radar-sm': { '0%': { transform: 'scale(1)', opacity: '.8' }, '100%': { transform: 'scale(1.18, 1.45)', opacity: '0' } },
      },
      animation: {
        bounce3: 'bounce3 1.2s infinite',
        ping2: 'ping2 1.6s cubic-bezier(0,0,.2,1) infinite',
        eq: 'eq .9s ease-in-out infinite',
        radar: 'radar 2s cubic-bezier(0,0,.2,1) infinite',
        'radar-sm': 'radar-sm 2s cubic-bezier(0,0,.2,1) infinite',
      },
    },
  },
  plugins: [],
}
