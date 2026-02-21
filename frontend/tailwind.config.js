/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#020617',
                surface: '#0f172a',
                neonCyan: '#06b6d4',
                electricPurple: '#7c3aed',
            },
            fontFamily: {
                sans: ['Inter', 'Poppins', 'sans-serif'],
            },
            animation: {
                'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                pulseGlow: {
                    '0%, 100%': { opacity: '1', boxShadow: '0 0 10px #06b6d4' },
                    '50%': { opacity: '.5', boxShadow: '0 0 20px #06b6d4' },
                }
            }
        },
    },
    plugins: [],
}
