/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT:'#00CCBC', dark:'#00A89A', light:'#E6FAF9',
                   50:'#F0FFFE', 100:'#E6FAF9', 500:'#00CCBC', 600:'#00A89A', 700:'#008B7E' },
        surface:  { DEFAULT:'#FFFFFF', muted:'#F6F6F6', border:'#E5E7EB' },
        dark:     { DEFAULT:'#1B3A4B', footer:'#161616' },
        text:     { primary:'#1A1A1A', secondary:'#6B7280', muted:'#9CA3AF' },
      },
      fontFamily: {
        heading: ['DM Sans','sans-serif'],
        body:    ['Plus Jakarta Sans','sans-serif'],
        mono:    ['Space Mono','monospace'],
      },
      borderRadius: { card:'16px', button:'9999px', input:'9999px', badge:'9999px' },
      boxShadow: {
        card:'0 2px 12px rgba(0,0,0,0.08)', 'card-hover':'0 8px 24px rgba(0,0,0,0.12)',
        button:'0 2px 8px rgba(0,204,188,0.2)', nav:'0 1px 8px rgba(0,0,0,0.06)',
      },
      animation: { 'fade-up':'fadeUp 0.5s ease-out forwards', 'fade-in':'fadeIn 0.3s ease-out forwards' },
      keyframes: {
        fadeUp:  { '0%':{opacity:'0',transform:'translateY(20px)'}, '100%':{opacity:'1',transform:'translateY(0)'} },
        fadeIn:  { '0%':{opacity:'0'}, '100%':{opacity:'1'} },
      },
    },
  },
  plugins: [],
}
