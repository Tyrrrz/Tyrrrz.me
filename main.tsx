import type { RouteRecord } from "vite-react-ssg";
import { ViteReactSSG } from "vite-react-ssg";
import Layout from "./components/layout";
import "./pages/globals.css";
import { lazyImport } from "./utils/lazy";

const routes: RouteRecord[] = [
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        lazy: lazyImport(() => import("./pages/index").then((m) => ({ Component: m.default }))),
      },
      {
        path: "blog",
        lazy: lazyImport(() =>
          import("./pages/blog/index").then((m) => ({ Component: m.default })),
        ),
      },
      {
        path: "blog/:id",
        lazy: lazyImport(() =>
          import("./pages/blog/entry").then((m) => ({ Component: m.default })),
        ),
        getStaticPaths: async () => {
          const { blogPostRefs } = await import("virtual:blog");
          return blogPostRefs.map((p: { id: string }) => `blog/${p.id}`);
        },
      },
      {
        path: "projects",
        lazy: lazyImport(() =>
          import("./pages/projects/index").then((m) => ({ Component: m.default })),
        ),
      },
      {
        path: "speaking",
        lazy: lazyImport(() =>
          import("./pages/speaking/index").then((m) => ({ Component: m.default })),
        ),
      },
      {
        path: "donate",
        lazy: lazyImport(() => import("./pages/donate").then((m) => ({ Component: m.default }))),
      },
      {
        path: "ukraine",
        lazy: lazyImport(() => import("./pages/ukraine").then((m) => ({ Component: m.default }))),
      },
      {
        path: "*",
        lazy: lazyImport(() => import("./pages/404").then((m) => ({ Component: m.default }))),
      },
    ],
  },
];

export const createRoot = ViteReactSSG({ routes });
