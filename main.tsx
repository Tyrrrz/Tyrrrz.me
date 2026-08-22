import type { ComponentType } from "react";
import type { RouteRecord } from "vite-react-ssg";
import { ViteReactSSG } from "vite-react-ssg";
import Layout from "./components/layout";
import "./pages/globals.css";

// When the site is redeployed, previously built asset files (e.g. JS chunks)
// get deleted from the server. If a user is still browsing an old version of
// the site and navigates to a route whose chunk is no longer available,
// the dynamic import will fail (404). Instead of showing an error, we reload
// the page, which picks up the latest deployment.
const route = (importPage: () => Promise<{ default: ComponentType }>) => {
  return async () => {
    try {
      const { default: Component } = await importPage();
      return { Component };
    } catch (error) {
      if (typeof window === "undefined") {
        throw error;
      }

      window.location.reload();

      // Prevent the router from rendering an error while the reload is in progress
      return new Promise<never>(() => {});
    }
  };
};

const routes: RouteRecord[] = [
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        lazy: route(() => import("./pages/index")),
      },
      {
        path: "blog",
        lazy: route(() => import("./pages/blog/index")),
      },
      {
        path: "blog/:id",
        lazy: route(() => import("./pages/blog/entry")),
        getStaticPaths: async () => {
          const { blogPostRefs } = await import("virtual:blog");
          return blogPostRefs.map((p: { id: string }) => `blog/${p.id}`);
        },
      },
      {
        path: "projects",
        lazy: route(() => import("./pages/projects/index")),
      },
      {
        path: "speaking",
        lazy: route(() => import("./pages/speaking/index")),
      },
      {
        path: "donate",
        lazy: route(() => import("./pages/donate")),
      },
      {
        path: "ukraine",
        lazy: route(() => import("./pages/ukraine")),
      },
      {
        path: "*",
        lazy: route(() => import("./pages/404")),
      },
    ],
  },
];

export const createRoot = ViteReactSSG({ routes });
