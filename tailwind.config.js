/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
        "!./node_modules/**",
        "!./dist/**"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                display: ['"Bricolage Grotesque"', 'sans-serif'],
            },
            colors: {
                paper: 'var(--color-paper)',
                ink: 'var(--color-ink)',
                white: 'var(--color-surface)',
                'fixed-ink': '#1A1A1A', // Always black
                'fixed-white': '#FFFFFF', // Always white
                banky: {
                    yellow: '#D4FF00',
                    pink: '#FF90E8',
                    blue: '#59C3FF',
                    green: '#00FFA3',
                    purple: '#B98EFF',
                    orange: '#FF7D33',
                    black: '#121212',
                }
            },
            boxShadow: {
                'neo': '5px 5px 0px 0px var(--color-ink)',
                'neo-lg': '10px 10px 0px 0px var(--color-ink)',
                'neo-sm': '3px 3px 0px 0px var(--color-ink)',
                'neo-hover': '7px 7px 0px 0px var(--color-ink)',
                'neo-xl': '15px 15px 0px 0px var(--color-ink)',
            },
            borderWidth: {
                '3': '3px',
                '4': '4px',
            },
            animation: {
                'marquee': 'marquee 25s linear infinite',
                'bounce-slow': 'bounce 3s infinite',
                'wiggle': 'wiggle 2s ease-in-out infinite',
                'shake': 'shake 0.3s linear infinite',
                'blink': 'blink 4s infinite',
                'shimmer': 'shimmer 1.5s linear infinite',
                'float': 'float 4s ease-in-out infinite',
                'float-delayed': 'float 4s ease-in-out 2s infinite',
                'spin-slow': 'spin 12s linear infinite',
                'fade-in': 'fadeIn 0.3s ease-out forwards',
                'fade-in-up': 'fadeInUp 0.4s ease-out forwards',
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-100%)' },
                },
                wiggle: {
                    '0%, 100%': { transform: 'rotate(-5deg)' },
                    '50%': { transform: 'rotate(5deg)' },
                },
                shake: {
                    '0%, 100%': { transform: 'translate(0, 0) rotate(0)' },
                    '25%': { transform: 'translate(-2px, 1px) rotate(-1deg)' },
                    '50%': { transform: 'translate(1px, -1px) rotate(1deg)' },
                    '75%': { transform: 'translate(-1px, 2px) rotate(0)' },
                },
                blink: {
                    '0%, 96%, 100%': { transform: 'scaleY(1)' },
                    '98%': { transform: 'scaleY(0.1)' },
                },
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' }
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-15px)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        }
    },
    plugins: [],
}
