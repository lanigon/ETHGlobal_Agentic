/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/game/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            // 你的自定义主题配置
        },
    },
    plugins: [],
};

