import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import type { Plugin } from "vite";

function virtualJsonPlugin(
  name: string,
  virtualId: string,
  getCode: () => string,
): Plugin {
  const resolvedId = `\0${virtualId}`;
  return {
    name,
    resolveId: (id) => (id === virtualId ? resolvedId : null),
    load: (id) => (id === resolvedId ? getCode() : undefined),
  };
}

export default defineConfig(async () => {
  const { bufferIterable } = await import("./utils/async.js");

  // Blog data
  let blogPostsJson = "[]";
  let blogPostRefsJson = "[]";
  try {
    const { loadBlogPosts, publishBlogFeed, publishBlogPostAssets } = await import(
      "./data/blog/index.js"
    );
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

  // Projects data
  let projectsJson = "[]";
  try {
    const { loadProjects, publishProjectStats } = await import("./data/projects/index.js");
    await publishProjectStats();
    const projects = await bufferIterable(loadProjects());
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
  } catch (error) {
    console.warn("[virtual:projects] Failed to load projects data:", (error as Error).message);
  }

  // Donations data
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

  // Speaking data
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

  return {
    plugins: [
      react(),
      virtualJsonPlugin(
        "virtual:blog",
        "virtual:blog",
        () =>
          `export const blogPosts = ${blogPostsJson};\n` +
          `export const blogPostRefs = ${blogPostRefsJson};`,
      ),
      virtualJsonPlugin(
        "virtual:projects",
        "virtual:projects",
        () => `export const projects = ${projectsJson};`,
      ),
      virtualJsonPlugin(
        "virtual:donations",
        "virtual:donations",
        () => `export const donations = ${donationsJson};`,
      ),
      virtualJsonPlugin(
        "virtual:speaking",
        "virtual:speaking",
        () => `export const engagements = ${engagementsJson};`,
      ),
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
