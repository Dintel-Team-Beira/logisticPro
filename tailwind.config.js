import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
            colors: {
                // Cores do Akaunting
                sidebar: {
                    DEFAULT: '#F7F9FC',
                    dark: '#E8ECF3',
                    text: '#6B7280',
                    'text-active': '#1F2937',
                    hover: '#EEF2F7',
                    border: '#E5E9F2',
                },
                primary: {
                    50: '#EFF6FF',
                    100: '#DBEAFE',
                    200: '#BFDBFE',
                    300: '#93C5FD',
                    400: '#60A5FA',
                    500: '#3B82F6',
                    600: '#2563EB',
                    700: '#1D4ED8',
                    800: '#1E40AF',
                    900: '#1E3A8A',
                },
            },
        },
    },

    plugins: [forms],
};
