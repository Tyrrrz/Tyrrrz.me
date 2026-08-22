/// <reference types="vite/client" />

declare module "*.css";

interface Window {
  goatcounter?: {
    count?: (options?: { path?: string }) => void;
  };
}

interface ImportMetaEnv {
  readonly SITE_URL: string;
  readonly BUILD_ID: string;
  readonly GOATCOUNTER_CODE: string;
}

declare module "virtual:blog" {
  export const blogPosts: import("./data/blog").BlogPost[];
  export const blogPostRefs: import("./data/blog").BlogPostRef[];
}

declare module "virtual:projects" {
  export const projects: import("./data/projects").Project[];
}

declare module "virtual:donations" {
  export const donations: import("./data/donate").Donation[];
}

declare module "virtual:speaking" {
  export const engagements: import("./data/speaking").SpeakingEngagement[];
}
