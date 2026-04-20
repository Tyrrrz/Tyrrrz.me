import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL || 'https://tyrrrz.me',

  output: 'static',

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  },

  redirects: {
    '/blog/return-type-inference': '/blog/target-type-inference',
    '/blog/rss.xml': '/blog.rss'
  }
});
