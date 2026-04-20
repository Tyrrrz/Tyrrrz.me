import { defineConfig } from 'eslint/config';
import astro from 'eslint-plugin-astro';

export default defineConfig([...astro.configs.recommended]);
