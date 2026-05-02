import tailwindcssAnimate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
  			mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
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
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			breathe: {
  				'0%, 100%': {
  					opacity: '0.6'
  				},
  				'50%': {
  					opacity: '0.85'
  				}
  			},
  			'tile-spawn': {
  				'0%': { transform: 'scale(0)', opacity: '0' },
  				'60%': { transform: 'scale(1.08)', opacity: '1' },
  				'100%': { transform: 'scale(1)', opacity: '1' }
  			},
  			'tile-merge': {
  				'0%': { transform: 'scale(1)' },
  				'40%': { transform: 'scale(1.18)' },
  				'100%': { transform: 'scale(1)' }
  			},
  			'orbit-slow': {
  				'0%': { transform: 'rotate(0deg)' },
  				'100%': { transform: 'rotate(360deg)' }
  			},
  			'orbit-reverse': {
  				'0%': { transform: 'rotate(360deg)' },
  				'100%': { transform: 'rotate(0deg)' }
  			},
  			'pulse-soft': {
  				'0%, 100%': { opacity: '0.4' },
  				'50%': { opacity: '0.9' }
  			},
  			'fade-up': {
  				'0%': { transform: 'translateY(8px)', opacity: '0' },
  				'100%': { transform: 'translateY(0)', opacity: '1' }
  			},
  			'merge-particle': {
  				'0%': {
  					transform: 'translate(-50%, -50%) translate(0, 0) scale(0.5)',
  					opacity: '1'
  				},
  				'100%': {
  					transform: 'translate(-50%, -50%) translate(calc(var(--p-dx) * 38px), calc(var(--p-dy) * 38px)) scale(0)',
  					opacity: '0'
  				}
  			},
  			'merge-ring': {
  				'0%': { transform: 'scale(1)', opacity: '0.85' },
  				'100%': { transform: 'scale(1.55)', opacity: '0' }
  			},
  			'drift': {
  				'0%': { transform: 'translate(0, 0)', opacity: '0' },
  				'10%': { opacity: '0.7' },
  				'90%': { opacity: '0.7' },
  				'100%': { transform: 'translate(60px, -90px)', opacity: '0' }
  			},
  			'data-stream': {
  				'0%': { transform: 'translateX(-100%)', opacity: '0' },
  				'10%': { opacity: '0.65' },
  				'85%': { opacity: '0.65' },
  				'100%': { transform: 'translateX(120vw)', opacity: '0' }
  			},
  			'discovery-flash': {
  				'0%': { opacity: '0' },
  				'25%': { opacity: '0.45' },
  				'100%': { opacity: '0' }
  			},
  			'score-pop': {
  				'0%': { transform: 'translate(-50%, -50%) scale(0.5)', opacity: '0' },
  				'15%': { transform: 'translate(-50%, -65%) scale(1.15)', opacity: '1' },
  				'40%': { transform: 'translate(-50%, -90%) scale(1)', opacity: '1' },
  				'100%': { transform: 'translate(-50%, -180%) scale(0.95)', opacity: '0' }
  			},
  			'screen-shake-light': {
  				'0%, 100%': { transform: 'translate(0, 0)' },
  				'20%': { transform: 'translate(-2px, 1px)' },
  				'40%': { transform: 'translate(2px, -1px)' },
  				'60%': { transform: 'translate(-1px, 2px)' },
  				'80%': { transform: 'translate(1px, -2px)' }
  			},
  			'screen-shake-heavy': {
  				'0%, 100%': { transform: 'translate(0, 0)' },
  				'15%': { transform: 'translate(-5px, 2px) rotate(-0.3deg)' },
  				'30%': { transform: 'translate(5px, -2px) rotate(0.3deg)' },
  				'45%': { transform: 'translate(-3px, 4px) rotate(-0.2deg)' },
  				'60%': { transform: 'translate(3px, -4px) rotate(0.2deg)' },
  				'75%': { transform: 'translate(-2px, 1px)' },
  				'90%': { transform: 'translate(1px, -1px)' }
  			},
  			'combo-pop': {
  				'0%': { transform: 'translate(-50%, 0) scale(0.4)', opacity: '0' },
  				'18%': { transform: 'translate(-50%, 0) scale(1.25)', opacity: '1' },
  				'35%': { transform: 'translate(-50%, 0) scale(1)', opacity: '1' },
  				'85%': { opacity: '1' },
  				'100%': { transform: 'translate(-50%, -8px) scale(0.95)', opacity: '0' }
  			},
  			'ready-pulse': {
  				'0%, 100%': { transform: 'scale(1)', opacity: '0.85' },
  				'50%': { transform: 'scale(1.06)', opacity: '1' }
  			},
  			'gameover-letter': {
  				'0%': { transform: 'translateY(-30px) scale(1.4)', opacity: '0', filter: 'blur(8px)' },
  				'60%': { transform: 'translateY(0) scale(1)', opacity: '1', filter: 'blur(0)' },
  				'100%': { transform: 'translateY(0) scale(1)', opacity: '1' }
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			breathe: 'breathe 4s ease-in-out infinite',
  			'tile-spawn': 'tile-spawn 200ms ease-out',
  			'tile-merge': 'tile-merge 200ms ease-out',
  			'orbit-slow': 'orbit-slow 80s linear infinite',
  			'orbit-reverse': 'orbit-reverse 120s linear infinite',
  			'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
  			'fade-up': 'fade-up 400ms ease-out',
  			'merge-particle': 'merge-particle 480ms ease-out forwards',
  			'merge-ring': 'merge-ring 360ms ease-out forwards',
  			'drift': 'drift 14s linear infinite',
  			'data-stream': 'data-stream 6s linear',
  			'discovery-flash': 'discovery-flash 800ms ease-out',
  			'score-pop': 'score-pop 900ms ease-out forwards',
  			'screen-shake-light': 'screen-shake-light 250ms ease-out',
  			'screen-shake-heavy': 'screen-shake-heavy 360ms ease-out',
  			'combo-pop': 'combo-pop 1100ms ease-out forwards',
  			'ready-pulse': 'ready-pulse 1.6s ease-in-out infinite',
  			'gameover-letter': 'gameover-letter 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [tailwindcssAnimate],
}
