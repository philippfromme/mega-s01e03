import { resolve } from 'node:path';
import adapter from '@sveltejs/adapter-auto';
import { mdsvex } from 'mdsvex';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const runbookLayout = resolve('./src/lib/layouts/runbook.svelte');
const config = {
  extensions: ['.svelte', '.svx'],
  preprocess: [
    vitePreprocess(),
    mdsvex({
      extensions: ['.svx'],
      layout: {
        runbook: runbookLayout,
        _: runbookLayout
      }
    })
  ],
  kit: {
    alias: {
      '#lib': './src/lib'
    },
    adapter: adapter()
  }
};

export default config;
