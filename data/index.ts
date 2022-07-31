import frontmatter from 'front-matter';
import fs from 'fs/promises';
import path from 'path';

export type BlogPost = {
  id: string;
  title: string;
  date: string;
  timeToReadMs: number;
  source: string;
};

export const loadBlogPosts = async function* () {
  const dirPath = path.resolve(process.cwd(), 'data', 'blog');

  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const id = entry.name;
    const filePath = path.join(dirPath, id, 'index.md');

    const {
      attributes: { title, date },
      body
    } = frontmatter(await fs.readFile(filePath, 'utf8'));

    if (!title || typeof title !== 'string') {
      throw new Error(`Blog post '${id}' has no title`);
    }

    if (!date || typeof date !== 'string') {
      throw new Error(`Blog post '${id}' has no date`);
    }

    const timeToReadMs = (body.split(/\s/g).length * 60000) / 350;

    const post: BlogPost = {
      id,
      title,
      date,
      timeToReadMs,
      source: body
    };

    yield post;
  }
};

export const loadBlogPost = async (id: string) => {
  for await (const post of loadBlogPosts()) {
    if (post.id === id) {
      return post;
    }
  }

  throw new Error(`Blog post '${id}' not found`);
};

export type BlogPostRef = Omit<BlogPost, 'source'>;

export const loadBlogPostRefs = async function* () {
  for await (const post of loadBlogPosts()) {
    const ref: BlogPostRef = {
      id: post.id,
      title: post.title,
      date: post.date,
      timeToReadMs: post.timeToReadMs
    };

    yield ref;
  }
};

export type Project = {
  name: string;
  url: string;
  description?: string;
  homepageUrl?: string;
  stars: number;
  downloads: number;
  language?: string;
};

export const loadProjects = async function* () {
  const dirPath = path.resolve(process.cwd(), 'data', 'projects');

  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) {
      continue;
    }

    const filePath = path.join(dirPath, entry.name);
    const project: Project = JSON.parse(await fs.readFile(filePath, 'utf8'));

    yield project;
  }
};

export type SpeakingEngagement = {
  title: string;
  kind: 'Talk' | 'Workshop' | 'Podcast';
  event: string;
  date: string;
  language: string;
  eventUrl?: string;
  presentationUrl?: string;
  recordingUrl?: string;
};

export const loadSpeakingEngagements = async function* () {
  const dirPath = path.resolve(process.cwd(), 'data', 'speaking');

  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) {
      continue;
    }

    const filePath = path.join(dirPath, entry.name);
    const engagement: SpeakingEngagement = JSON.parse(await fs.readFile(filePath, 'utf8'));

    yield engagement;
  }
};

export type Donation = {
  name: string;
  amount: number;
  platform: string;
};

export const loadDonations = async function* () {
  const filePath = path.resolve(process.cwd(), 'data', 'donate', 'donations.json');
  const donations: Donation[] = JSON.parse(await fs.readFile(filePath, 'utf8'));

  for (const donation of donations) {
    yield donation;
  }
};
