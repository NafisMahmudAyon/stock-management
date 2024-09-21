/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				"primary-bg": "var(--color-primary-bg)",
				"secondary-bg": "var(--color-secondary-bg)",
				"primary": "var(--color-primary)",
				"secondary": "var(--color-secondary)",
				"typography": "var(--color-typography)",
			},
		},
	},
	plugins: [],
};

