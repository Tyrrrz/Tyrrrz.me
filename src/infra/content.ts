import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import readingTime from 'reading-time';
import remarkHtml from 'remark-html';
import remarkParse from 'remark-parse';
import unified from 'unified';
import { trimEnd } from './utils';

// Paths are relative to project root
const blogPostsDirPath = path.resolve('./data/blog/');
const projectsDirPath = path.resolve('./data/projects/');
const talksDirPath = path.resolve('./data/talks/');

interface BlogPostTranslation {
  language: string;
  url: string;
}

interface BlogPostMeta {
  id: string;
  title: string;
  date: string;
  tags: string[];
  translations?: BlogPostTranslation[] | undefined;
}

export interface BlogPost extends BlogPostMeta {
  timeToReadMins: number;
  html: string;
}

export function getBlogPost(id: string) {
  const filePath = path.resolve(blogPostsDirPath, id, 'Post.md');
  const fileContent = fs.readFileSync(filePath, 'utf8');

  const frontMatter = matter(fileContent);

  const meta = { ...frontMatter.data, id } as BlogPostMeta;

  const timeToReadMins = readingTime(frontMatter.content).minutes;

  const html = unified()
    .use(remarkParse)
    .use(remarkHtml)
    .processSync(frontMatter.content)
    .toString();

  return {
    ...meta,
    timeToReadMins,
    html
  } as BlogPost;
}

export function getBlogPosts() {
  const ids = fs.readdirSync(blogPostsDirPath, 'utf-8');

  return ids.map(getBlogPost);
}

export interface Project {
  id: string;
  name: string;
  url: string;
  description: string;
  stars: number;
  language: string;
}

export function getProject(id: string) {
  const filePath = path.resolve(projectsDirPath, `${id}.json`);
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  return {
    ...JSON.parse(fileContent),
    id
  } as Project;
}

export function getProjects() {
  return fs
    .readdirSync(projectsDirPath)
    .map((name) => trimEnd(name, '.json'))
    .map(getProject);
}

export interface Talk {
  id: string;
  title: string;
  event: string;
  date: string;
  language: string;
  eventUrl: string;
  presentationUrl?: string | undefined;
  recordingUrl?: string | undefined;
}

export function getTalk(id: string) {
  const filePath = path.resolve(talksDirPath, `${id}.json`);
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  return {
    ...JSON.parse(fileContent),
    id
  } as Talk;
}

export function getTalks() {
  return fs
    .readdirSync(talksDirPath)
    .map((name) => trimEnd(name, '.json'))
    .map(getTalk);
}
