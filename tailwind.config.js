/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './views/*.html',
        './views/articles/*.html',
        './views/managers/*.html',
        './views/errors/*.html',
        './views/checkout/*.html',
        './public/javascripts/*.js',
    ],
    theme: {
        fontFamily: {
            sans: ['Poppins', 'Noto Sans Thai', 'sans-serif'],
            mono: ['DM Mono', 'monospace'],
            display: ['Major Mono Display', 'monospace'],
        },
        extend: {},
    },
    plugins: [],
}

