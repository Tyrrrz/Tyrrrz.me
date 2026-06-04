declare module "*.css";

declare module "virtual:blog" {
  import type { BlogPost, BlogPostRef } from "~/data/blog";
  export const blogPosts: BlogPost[];
  export const blogPostRefs: BlogPostRef[];
}

declare module "virtual:projects" {
  import type { Project } from "~/data/projects";
  export const projects: Project[];
}

declare module "virtual:donations" {
  import type { Donation } from "~/data/donate";
  export const donations: Donation[];
}

declare module "virtual:speaking" {
  import type { SpeakingEngagement } from "~/data/speaking";
  export const engagements: SpeakingEngagement[];
}
