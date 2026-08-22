import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vite";
import {
  loadBlogPostRefs,
  loadBlogPosts,
  publishBlogFeed,
  publishBlogPostAssets,
} from "./data/blog";
import { loadDonations, publishDonationStats } from "./data/donate";
import { loadProjects, publishProjectStats } from "./data/projects";
import { loadSpeakingEngagements } from "./data/speaking";
import { bufferIterable } from "./utils/async";

const virtualPlugin = (id: string, getCode: () => string) => {
  const resolvedId = `\0${id}`;
  const plugin: Plugin = {
    name: id,
    resolveId: (importId) => (importId === id ? resolvedId : null),
    load: (loadId) => (loadId === resolvedId ? getCode() : undefined),
  };
  return plugin;
};

const blogPlugin = async () => {
  // Stateful side-effect: generate the blog RSS feed
  await publishBlogFeed();

  const postRefs = await bufferIterable(loadBlogPostRefs());
  const posts = await bufferIterable(loadBlogPosts());

  // Stateful side-effect: publish blog post assets to the public directory
  for (const post of postRefs) {
    await publishBlogPostAssets(post.id);
  }

  return virtualPlugin(
    "virtual:blog",
    () =>
      `export const blogPosts = ${JSON.stringify(posts)};\n` +
      `export const blogPostRefs = ${JSON.stringify(postRefs)};`,
  );
};

const projectsPlugin = async () => {
  // Stateful side-effect: generate project stats SVG
  await publishProjectStats();

  const projects = await bufferIterable(loadProjects());

  return virtualPlugin(
    "virtual:projects",
    () => `export const projects = ${JSON.stringify(projects)};`,
  );
};

const donationsPlugin = async () => {
  // Stateful side-effect: generate donation stats SVG
  await publishDonationStats();

  const donations = await bufferIterable(loadDonations());

  return virtualPlugin(
    "virtual:donations",
    () => `export const donations = ${JSON.stringify(donations)};`,
  );
};

const speakingPlugin = async () => {
  const engagements = await bufferIterable(loadSpeakingEngagements());

  return virtualPlugin(
    "virtual:speaking",
    () => `export const engagements = ${JSON.stringify(engagements)};`,
  );
};

const siteUrl = process.env.SITE_URL || "http://localhost:3000";
const base = new URL(siteUrl).pathname.replace(/\/?$/, "/");

export default defineConfig(async () => {
  return {
    base,

    plugins: [
      react(),
      tailwindcss(),
      await blogPlugin(),
      await projectsPlugin(),
      await donationsPlugin(),
      await speakingPlugin(),
    ],

    build: {
      outDir: "dist",
      emptyOutDir: true,
    },

    server: {
      port: 3000,
    },

    define: {
      "import.meta.env.SITE_URL": JSON.stringify(siteUrl || "http://localhost:3000"),
      "import.meta.env.BUILD_ID": JSON.stringify(process.env["BUILD_ID"] || ""),
      "import.meta.env.GOATCOUNTER_CODE": JSON.stringify(process.env["GOATCOUNTER_CODE"] || ""),
    },

    ssr: {
      noExternal: ["react-fade-in"],
    },
  };
});
