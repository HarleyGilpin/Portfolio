/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
    ],
    plugins: [
        require('@tailwindcss/typography'),
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
            typography: (theme) => ({
                DEFAULT: {
                    css: {
                        color: 'var(--text-secondary)',
                        h1: { color: 'var(--text-primary)' },
                        h2: { color: 'var(--text-primary)' },
                        h3: { color: 'var(--text-primary)' },
                        h4: { color: 'var(--text-primary)' },
                        strong: { color: 'var(--text-primary)' },
                        a: { color: 'var(--accent-primary)', '&:hover': { color: 'var(--accent-secondary)' } },
                        code: { color: 'var(--accent-primary)' },
                        'ul > li::marker': { color: 'var(--accent-primary)' },
                        'ol > li::marker': { color: 'var(--accent-primary)' },
                        blockquote: { borderLeftColor: 'var(--accent-primary)', color: 'var(--text-muted)' },
                    },
                },
                invert: {
                    css: {
                        color: 'var(--text-secondary)',
                        h1: { color: 'var(--text-primary)' },
                        h2: { color: 'var(--text-primary)' },
                        h3: { color: 'var(--text-primary)' },
                        h4: { color: 'var(--text-primary)' },
                        strong: { color: 'var(--text-primary)' },
                        a: { color: 'var(--accent-primary)', '&:hover': { color: 'var(--accent-secondary)' } },
                        code: { color: 'var(--accent-primary)' },
                        'ul > li::marker': { color: 'var(--accent-primary)' },
                        'ol > li::marker': { color: 'var(--accent-primary)' },
                        blockquote: { borderLeftColor: 'var(--accent-primary)', color: 'var(--text-muted)' },
                    }
                }
            }),
        },
    },
}
