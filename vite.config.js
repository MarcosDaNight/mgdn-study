import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-node';
import { defineConfig } from 'vite';

// SvelteKit 3 não lê mais o svelte.config.js (a configuração vai no plugin) e removeu o
// alias `$lib`; mantê-lo aqui evita reescrever os imports (a alternativa é `#lib`).
export default defineConfig({
  plugins: [sveltekit({ adapter: adapter({ precompress: true }), alias: { $lib: 'src/lib' } })]
});
