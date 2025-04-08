import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
	
	experimental: {
		svg: true,
	},
	vite: {
		plugins: [tailwindcss()],
	},
});
