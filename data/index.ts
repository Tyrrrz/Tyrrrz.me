import frontmatter from 'front-matter';
import fs from 'fs/promises';
import path from 'path';

export type BlogPost = {
  id: string;
  title: string;
  date: string;
  content: string;
};

export const getBlogPosts = async function* () {
  const dirPath = path.resolve(process.cwd(), 'data', 'blog');

  const ents = await fs.readdir(dirPath, { withFileTypes: true });
  for (const ent of ents) {
    if (!ent.isDirectory()) {
      continue;
    }

    const id = ent.name;
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

    const post: BlogPost = {
      id,
      title,
      date,
      content: body
    };

    yield post;
  }
};

export const getBlogPost = async (id: string) => {
  for await (const post of getBlogPosts()) {
    if (post.id === id) {
      return post;
    }
  }

  throw new Error(`Blog post '${id}' not found`);
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

export const getProjects = async function* () {
  const dirPath = path.resolve(process.cwd(), 'data', 'projects');

  const ents = await fs.readdir(dirPath, { withFileTypes: true });
  for (const ent of ents) {
    if (!ent.isFile() || !ent.name.endsWith('.json')) {
      continue;
    }

    const filePath = path.join(dirPath, ent.name);
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

export const getSpeakingEngagements = async function* () {
  const dirPath = path.resolve(process.cwd(), 'data', 'speaking');

  const ents = await fs.readdir(dirPath, { withFileTypes: true });
  for (const ent of ents) {
    if (!ent.isFile() || !ent.name.endsWith('.json')) {
      continue;
    }

    const filePath = path.join(dirPath, ent.name);
    const engagement: SpeakingEngagement = JSON.parse(await fs.readFile(filePath, 'utf8'));

    yield engagement;
  }
};

export type Donation = {
  name: string;
  amount: number;
  platform: string;
};

export const getDonations = async function* () {
  const filePath = path.resolve(process.cwd(), 'data', 'donate', 'donations.json');
  const donations: Donation[] = JSON.parse(await fs.readFile(filePath, 'utf8'));

  for (const donation of donations) {
    yield donation;
  }
};
