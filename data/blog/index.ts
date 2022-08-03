import { getSiteUrl } from '@/utils/env';
import { Feed } from 'feed';
import frontmatter from 'front-matter';
import fs from 'fs/promises';
import markdownToTxt from 'markdown-to-txt';
import path from 'path';

export type BlogPost = {
  id: string;
  title: string;
  date: string;
  timeToReadMs: number;
  isCoverAvailable: boolean;
  excerpt: string;
  source: string;
};

export type BlogPostRef = Omit<BlogPost, 'source'>;

export const loadBlogPosts = async function* () {
  const dirPath = path.resolve(process.cwd(), 'data', 'blog');
  const entries = await fs.opendir(dirPath);

  for await (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const id = entry.name;
    const indexFilePath = path.join(dirPath, id, 'index.md');
    const coverFilePath = path.join(dirPath, id, 'cover.png');

    const {
      attributes: { title, date },
      body
    } = frontmatter(await fs.readFile(indexFilePath, 'utf8'));

    if (!title || typeof title !== 'string') {
      throw new Error(`Blog post '${id}' has missing or invalid title`);
    }

    if (!date || typeof date !== 'string') {
      throw new Error(`Blog post '${id}' has missing or invalid date`);
    }

    const timeToReadMs = (body.split(/\s/g).length * 60000) / 350;

    const isCoverAvailable = await fs
      .access(coverFilePath)
      .then(() => true)
      .catch(() => false);

    const excerpt = markdownToTxt(body).slice(0, 256) + '…';

    const post: BlogPost = {
      id,
      title,
      date,
      timeToReadMs,
      isCoverAvailable,
      excerpt,
      source: body
    };

    yield post;
  }
};

export const loadBlogPostRefs = async function* () {
  for await (const post of loadBlogPosts()) {
    const ref: BlogPostRef = {
      id: post.id,
      title: post.title,
      date: post.date,
      timeToReadMs: post.timeToReadMs,
      isCoverAvailable: post.isCoverAvailable,
      excerpt: post.excerpt
    };

    yield ref;
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

export const publishBlogPostAssets = async (id: string) => {
  const dirPath = path.resolve(process.cwd(), 'data', 'blog', id);
  const targetDirPath = path.resolve(process.cwd(), 'public', 'blog', id);

  await fs.rm(targetDirPath, { recursive: true, force: true });
  await fs.cp(dirPath, targetDirPath, {
    recursive: true,
    filter: (src) => {
      return ['', '.png', '.jpg'].includes(path.extname(src));
    }
  });
};

export const publishBlogFeed = async () => {
  const filePath = path.resolve(process.cwd(), 'public', 'blog', 'rss.xml');

  const date = new Date();

  const feed = new Feed({
    id: getSiteUrl(),
    title: "Oleksii Holub's Blog",
    description:
      'Oleksii Holub (@tyrrrz) is a software developer, open source maintainer, tech blogger and conference speaker',
    link: getSiteUrl('/blog'),
    image: getSiteUrl('/logo.png'),
    copyright: `Copyright (c) 2019-${date.getFullYear()} Oleksii Holub`,
    updated: date
  });

  for await (const post of loadBlogPosts()) {
    feed.addItem({
      id: getSiteUrl(`/blog/${post.id}`),
      link: getSiteUrl(`/blog/${post.id}`),
      date: new Date(post.date),
      title: post.title,
      description: post.excerpt
    });
  }

  feed.items.sort((a, b) => b.date.getTime() - a.date.getTime());

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.rm(filePath, { force: true });
  await fs.writeFile(filePath, feed.rss2());
};
