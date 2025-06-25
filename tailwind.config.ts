import type { Config } from "tailwindcss";
import colors from 'tailwindcss/colors'; // 导入 Tailwind 颜色

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // 添加 src 目录如果 Starwind UI 在这里
  ],
  darkMode: 'class', // 启用基于类的深色模式
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
        },
        // 如果 Starwind UI 需要其他颜色，也在这里添加
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // 如果 Starwind UI 需要表单插件
    require('@tailwindcss/aspect-ratio'), // 如果 Starwind UI 需要宽高比插件
    // 如果 Starwind UI 基于 Headless UI 或其他库，可能需要相应插件
  ],
};
export default config;
