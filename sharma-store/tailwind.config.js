/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#f87816",
                "background-light": "#f8fafc",
                "background-dark": "#101728",
            },
            fontFamily: {
                "sans": ["Outfit", "sans-serif"],
                "display": ["Outfit", "sans-serif"]
            },
            borderRadius: {
                "lg": "1rem",
                "xl": "1.5rem",
                "2xl": "2rem",
                "3xl": "2.5rem",
            },
        },
    },
    plugins: [],
}
