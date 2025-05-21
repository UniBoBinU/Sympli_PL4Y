
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
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
				},
				game: {
					primary: '#4C038E', // Purple
					secondary: '#FB007C', // Magenta
					bonus: '#0085FB', // Blue
					penalty: '#ef4444',
					finish: '#f59e0b',
					neon: '#07F9AF', // Neon green
					board: {
						light: '#f3f4f6',
						dark: '#e5e7eb',
					}
				},
				player: {
					'1': '#ef4444',
					'2': '#3b82f6',
					'3': '#10b981',
					'4': '#f59e0b',
					'5': '#8b5cf6',
					'6': '#ec4899',
					'7': '#06b6d4',
					'8': '#84cc16',
				},
				magenta: {
					'300': 'hsl(var(--magenta-300))',
					'400': 'hsl(var(--magenta-400))',
					'500': 'hsl(var(--magenta-500))',
				},
				cyan: {
					'300': 'hsl(var(--cyan-300))',
					'400': 'hsl(var(--cyan-400))',
					'500': 'hsl(var(--cyan-500))',
				},
				purple: {
					'600': 'hsl(var(--purple-600))',
					'800': 'hsl(var(--purple-800))',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
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
				},
				'dice-roll': {
					'0%': { transform: 'rotateX(0deg) rotateY(0deg)' },
					'25%': { transform: 'rotateX(90deg) rotateY(180deg)' },
					'50%': { transform: 'rotateX(180deg) rotateY(90deg)' },
					'75%': { transform: 'rotateX(270deg) rotateY(270deg)' },
					'100%': { transform: 'rotateX(360deg) rotateY(360deg)' }
				},
				'token-move': {
					'0%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-20px)' },
					'100%': { transform: 'translateY(0px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'dice-roll': 'dice-roll 0.6s ease-out',
				'token-move': 'token-move 0.5s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
