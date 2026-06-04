import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

const virtualJsonPlugin = (id: string, getCode: () => string) => {
  const resolvedId = `\0${id}`;
  const plugin: Plugin = {
    name: id,
    resolveId: (importId) => (importId === id ? resolvedId : null),
    load: (loadId) => (loadId === resolvedId ? getCode() : undefined),
  };
  return plugin;
};

const createBlogPlugin = async () => {
  const { bufferIterable } = await import("./utils/async.js");

  let blogPostsJson = "[]";
  let blogPostRefsJson = "[]";
  try {
    const { loadBlogPosts, publishBlogFeed, publishBlogPostAssets } =
      await import("./data/blog/index.js");
    await publishBlogFeed();
    const posts = await bufferIterable(loadBlogPosts());
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
  } catch (error) {
    console.warn("[virtual:blog] Failed to load blog data:", (error as Error).message);
  }

  return virtualJsonPlugin(
    "virtual:blog",
    () =>
      `export const blogPosts = ${blogPostsJson};\n` +
      `export const blogPostRefs = ${blogPostRefsJson};`,
  );
};

const createProjectsPlugin = async () => {
  const { bufferIterable } = await import("./utils/async.js");

  let projectsJson = "[]";
  try {
    const { loadProjects, publishProjectStats } = await import("./data/projects/index.js");
    await publishProjectStats();
    const projects = await bufferIterable(loadProjects());
    projects.sort(
      (a: { archived: boolean; stars: number }, b: { archived: boolean; stars: number }) => {
        if (a.archived && !b.archived) return 1;
        if (!a.archived && b.archived) return -1;
        return b.stars - a.stars;
      },
    );
    projectsJson = JSON.stringify(projects);
  } catch (error) {
    console.warn("[virtual:projects] Failed to load projects data:", (error as Error).message);
  }

  return virtualJsonPlugin(
    "virtual:projects",
    () => `export const projects = ${projectsJson};`,
  );
};

const createDonationsPlugin = async () => {
  const { bufferIterable } = await import("./utils/async.js");

  let donationsJson = "[]";
  try {
    const { loadDonations, publishDonationStats } = await import("./data/donate/index.js");
    await publishDonationStats();
    const donations = await bufferIterable(loadDonations());
    donations.sort((a: { amount: number }, b: { amount: number }) => b.amount - a.amount);
    donationsJson = JSON.stringify(donations);
  } catch (error) {
    console.warn("[virtual:donations] Failed to load donations data:", (error as Error).message);
  }

  return virtualJsonPlugin(
    "virtual:donations",
    () => `export const donations = ${donationsJson};`,
  );
};

const createSpeakingPlugin = async () => {
  const { bufferIterable } = await import("./utils/async.js");

  let engagementsJson = "[]";
  try {
    const { loadSpeakingEngagements } = await import("./data/speaking/index.js");
    const engagements = await bufferIterable(loadSpeakingEngagements());
    engagements.sort(
      (a: { date: string }, b: { date: string }) => Date.parse(b.date) - Date.parse(a.date),
    );
    engagementsJson = JSON.stringify(engagements);
  } catch (error) {
    console.warn("[virtual:speaking] Failed to load speaking data:", (error as Error).message);
  }

  return virtualJsonPlugin(
    "virtual:speaking",
    () => `export const engagements = ${engagementsJson};`,
  );
};

export default defineConfig(async () => {
  return {
    plugins: [
      react(),
      await createBlogPlugin(),
      await createProjectsPlugin(),
      await createDonationsPlugin(),
      await createSpeakingPlugin(),
    ],
    define: {
      "process.env.BUILD_ID": JSON.stringify(process.env["BUILD_ID"] || ""),
      "process.env.SITE_URL": JSON.stringify(process.env["SITE_URL"] || "http://localhost:3000"),
    },
    build: {
      outDir: "dist",
    },
    ssr: {
      noExternal: ["react-fade-in"],
    },
  };
});
