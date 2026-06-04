import type { RouteRecord } from "vite-react-ssg";
import { ViteReactSSG } from "vite-react-ssg";
import Layout from "~/components/layout";
import "~/pages/globals.css";

const routes: RouteRecord[] = [
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        lazy: () => import("~/pages/index").then((m) => ({ Component: m.default })),
      },
      {
        path: "blog",
        lazy: () => import("~/pages/blog/index").then((m) => ({ Component: m.default })),
      },
      {
        path: "blog/:id",
        lazy: () => import("~/pages/blog/entry").then((m) => ({ Component: m.default })),
        getStaticPaths: async () => {
          const { blogPostRefs } = await import("virtual:blog");
          return blogPostRefs.map((p: { id: string }) => `blog/${p.id}`);
        },
      },
      {
        path: "projects",
        lazy: () => import("~/pages/projects/index").then((m) => ({ Component: m.default })),
      },
      {
        path: "speaking",
        lazy: () => import("~/pages/speaking/index").then((m) => ({ Component: m.default })),
      },
      {
        path: "donate",
        lazy: () => import("~/pages/donate").then((m) => ({ Component: m.default })),
      },
      {
        path: "ukraine",
        lazy: () => import("~/pages/ukraine").then((m) => ({ Component: m.default })),
      },
      {
        path: "404",
        lazy: () => import("~/pages/404").then((m) => ({ Component: m.default })),
      },
    ],
  },
];

export const createApp = ViteReactSSG({ routes });
