/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bg-primary': 'var(--bg-primary)',
                'bg-secondary': 'var(--bg-secondary)',
                'bg-tertiary': 'var(--bg-tertiary)',
                'background': 'var(--bg-primary)',
                'card-bg': 'var(--bg-secondary)',
                'text-primary': 'var(--text-primary)',
                'text-secondary': 'var(--text-secondary)',
                'text-muted': 'var(--text-muted)',
                'accent-primary': 'var(--accent-primary)',
                'accent-secondary': 'var(--accent-secondary)',
                'accent-tertiary': 'var(--accent-tertiary)',
                'border-color': 'var(--border-color)',
            },
            fontFamily: {
                'outfit': ['Outfit', 'sans-serif'],
                'space-grotesk': ['Space Grotesk', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
