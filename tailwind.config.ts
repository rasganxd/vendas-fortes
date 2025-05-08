
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
				// Sales color palette - using blues similar to primary
				sales: {
					50: '#EBF5FF',
					100: '#E1EFFE',
					200: '#C3DDFD',
					300: '#A4CAFE',
					400: '#76A9FA',
					500: '#3F83F8',
					600: '#1C64F2',
					700: '#1A56DB',
					800: '#1E429F',
					900: '#233876',
				},
				// New modern color palette
				modern: {
					50: '#F5F7FA',
					100: '#E4E7EB',
					200: '#CBD2D9',
					300: '#9AA5B1',
					400: '#7B8794',
					500: '#616E7C',
					600: '#52606D',
					700: '#3E4C59',
					800: '#323F4B',
					900: '#1F2933',
				},
				blue: {
					50: '#EBF5FF',
					100: '#E1EFFE', 
					200: '#C3DDFD',
					300: '#A4CAFE',
					400: '#76A9FA',
					500: '#3F83F8',
					600: '#1C64F2',
					700: '#1A56DB',
					800: '#1E429F',
					900: '#233876',
				},
				teal: {
					50: '#EDFAFA',
					100: '#D5F5F6',
					200: '#AFECEF',
					300: '#7EDCE2',
					400: '#16BDCA',
					500: '#0694A2',
					600: '#047481',
					700: '#036672',
					800: '#05505C',
					900: '#014451',
				},
				red: {
					50: '#FDF2F2',
					100: '#FDE8E8',
					200: '#FBD5D5',
					300: '#F8B4B4',
					400: '#F98080',
					500: '#F05252',
					600: '#E02424',
					700: '#C81E1E',
					800: '#9B1C1C',
					900: '#771D1D',
				},
				green: {
					50: '#F3FAF7',
					100: '#DEF7EC',
					200: '#BCF0DA',
					300: '#84E1BC',
					400: '#31C48D',
					500: '#0E9F6E',
					600: '#057A55',
					700: '#046C4E',
					800: '#03543F',
					900: '#014737',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				'soft': '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
				'medium': '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)',
				'hard': '0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',
				'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
				'card': '0 2px 10px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.1)',
				'card-hover': '0 10px 20px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.05)',
				'panel': '0 12px 24px -6px rgba(0, 0, 0, 0.12), 0 0 1px rgba(0, 0, 0, 0.1)',
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
				'fade-in': {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				'slide-up': {
					from: { transform: 'translateY(10px)', opacity: '0' },
					to: { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-down': {
					from: { transform: 'translateY(-10px)', opacity: '0' },
					to: { transform: 'translateY(0)', opacity: '1' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-up': 'slide-up 0.4s ease-out',
				'slide-down': 'slide-down 0.4s ease-out'
			},
			backgroundImage: {
				'gradient-soft': 'linear-gradient(145deg, var(--tw-gradient-stops))',
				'gradient-diagonal': 'linear-gradient(135deg, var(--tw-gradient-stops))',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
