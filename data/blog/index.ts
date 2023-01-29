import ellipsize from 'ellipsize';
import { Feed } from 'feed';
import frontmatter from 'front-matter';
import fs from 'fs/promises';
import markdownToTxt from 'markdown-to-txt';
import path from 'path';
import readingTime from 'reading-time';
import { getSiteUrl } from '~/utils/env';

export type BlogPost = {
  id: string;
  title: string;
  date: string;
  readingTimeMins: number;
  coverUrl?: string;
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
    const childFileNames = await fs.readdir(path.resolve(dirPath, id));

    const indexFilePath = path.resolve(dirPath, id, 'index.md');
    const data = await fs.readFile(indexFilePath, 'utf8');

    const {
      attributes: { title, date },
      body
    } = frontmatter<{ title: string; date: string }>(data);

    if (!title || typeof title !== 'string') {
      throw new Error(`Blog post '${id}' has missing or invalid title`);
    }

    if (!date || typeof date !== 'string') {
      throw new Error(`Blog post '${id}' has missing or invalid date`);
    }

    const readingTimeMins = readingTime(body, { wordsPerMinute: 220 }).minutes;
    const coverFileName = childFileNames.find((fileName) => path.parse(fileName).name === 'cover');
    const coverUrl = coverFileName && `/blog/${id}/${coverFileName}`;
    const excerpt = ellipsize(markdownToTxt(body), 256);

    const post: BlogPost = {
      id,
      title,
      date,
      readingTimeMins,
      coverUrl,
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
      readingTimeMins: post.readingTimeMins,
      coverUrl: post.coverUrl,
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
