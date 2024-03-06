import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
	plugins: [sveltekit(), basicSsl()],
	test: {
		includeSource: ['src/**/*.{js,ts}']
	},
	define: {
		'import.meta.vitest': 'undefined'
	}
});
