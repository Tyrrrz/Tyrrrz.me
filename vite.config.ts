import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import type { Plugin } from "vite";

// Blog virtual module — loads all blog posts at build time
function blogPlugin(): Plugin {
  let blogPostsJson = "[]";
  let blogPostRefsJson = "[]";

  return {
    name: "virtual:blog",
    resolveId: (id) => (id === "virtual:blog" ? "\0virtual:blog" : null),
    async buildStart() {
      const { loadBlogPosts, publishBlogFeed, publishBlogPostAssets } = await import(
        "./data/blog/index.js"
      );
      const { bufferIterable } = await import("./utils/async.js");
      const { deleteUndefined } = await import("./utils/object.js");

      await publishBlogFeed();

      const posts = await bufferIterable(loadBlogPosts());
      deleteUndefined(posts);
      posts.sort(
        (a: { date: string }, b: { date: string }) => Date.parse(b.date) - Date.parse(a.date),
      );

      for (const post of posts) {
        await publishBlogPostAssets((post as { id: string }).id);
      }

      blogPostsJson = JSON.stringify(posts);
      blogPostRefsJson = JSON.stringify(
        posts.map(({ source: _source, ...ref }: { source: unknown }) => ref),
      );
    },
    load(id) {
      if (id !== "\0virtual:blog") return;
      return `export const blogPosts = ${blogPostsJson};\nexport const blogPostRefs = ${blogPostRefsJson};`;
    },
  };
}

// Projects virtual module — loads all projects at build time
function projectsPlugin(): Plugin {
  let projectsJson = "[]";

  return {
    name: "virtual:projects",
    resolveId: (id) => (id === "virtual:projects" ? "\0virtual:projects" : null),
    async buildStart() {
      const { loadProjects, publishProjectStats } = await import("./data/projects/index.js");
      const { bufferIterable } = await import("./utils/async.js");
      const { deleteUndefined } = await import("./utils/object.js");

      await publishProjectStats();

      const projects = await bufferIterable(loadProjects());
      deleteUndefined(projects);
      projects.sort(
        (
          a: { archived: boolean; stars: number },
          b: { archived: boolean; stars: number },
        ) => {
          if (a.archived && !b.archived) return 1;
          if (!a.archived && b.archived) return -1;
          return b.stars - a.stars;
        },
      );

      projectsJson = JSON.stringify(projects);
    },
    load(id) {
      if (id !== "\0virtual:projects") return;
      return `export const projects = ${projectsJson};`;
    },
  };
}

// Donations virtual module — loads all donations at build time
function donationsPlugin(): Plugin {
  let donationsJson = "[]";

  return {
    name: "virtual:donations",
    resolveId: (id) => (id === "virtual:donations" ? "\0virtual:donations" : null),
    async buildStart() {
      const { loadDonations, publishDonationStats } = await import("./data/donate/index.js");
      const { bufferIterable } = await import("./utils/async.js");
      const { deleteUndefined } = await import("./utils/object.js");

      await publishDonationStats();

      const donations = await bufferIterable(loadDonations());
      deleteUndefined(donations);
      donations.sort(
        (a: { amount: number }, b: { amount: number }) => b.amount - a.amount,
      );

      donationsJson = JSON.stringify(donations);
    },
    load(id) {
      if (id !== "\0virtual:donations") return;
      return `export const donations = ${donationsJson};`;
    },
  };
}

// Speaking virtual module — loads all speaking engagements at build time
function speakingPlugin(): Plugin {
  let engagementsJson = "[]";

  return {
    name: "virtual:speaking",
    resolveId: (id) => (id === "virtual:speaking" ? "\0virtual:speaking" : null),
    async buildStart() {
      const { loadSpeakingEngagements } = await import("./data/speaking/index.js");
      const { bufferIterable } = await import("./utils/async.js");
      const { deleteUndefined } = await import("./utils/object.js");

      const engagements = await bufferIterable(loadSpeakingEngagements());
      deleteUndefined(engagements);
      engagements.sort(
        (a: { date: string }, b: { date: string }) => Date.parse(b.date) - Date.parse(a.date),
      );

      engagementsJson = JSON.stringify(engagements);
    },
    load(id) {
      if (id !== "\0virtual:speaking") return;
      return `export const engagements = ${engagementsJson};`;
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    blogPlugin(),
    projectsPlugin(),
    donationsPlugin(),
    speakingPlugin(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: false, // Use the existing public/manifest.json
    }),
  ],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "."),
    },
  },
  define: {
    "process.env.BUILD_ID": JSON.stringify(process.env["BUILD_ID"] || ""),
    "process.env.SITE_URL": JSON.stringify(process.env["SITE_URL"] || "http://localhost:3000"),
  },
  build: {
    outDir: "dist",
  },
});
