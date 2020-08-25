import fs from 'fs';
import path from 'path';

// Paths are relative to project root
const blogPostsDirPath = path.resolve('./data/blog/');
const projectsDirPath = path.resolve('./data/projects/');
const talksDirPath = path.resolve('./data/talks/');

interface BlogPostTranslation {
  language: string;
  url: string;
}

export interface BlogPost {
  title: string;
  date: string;
  tags: string[];
  translations: BlogPostTranslation[];
  markdown: string;
}

export function getBlogPosts() {
  return [
    {
      title: 'Test1',
      date: '2020-04-28',
      tags: <string[]>[],
      translations: <BlogPostTranslation[]>[],
      markdown: ''
    },
    {
      title: 'Test2',
      date: '2020-04-38',
      tags: <string[]>[''],
      translations: <BlogPostTranslation[]>[],
      markdown: ''
    }
  ] as BlogPost[];
}

export function getBlogPost(id: string) {
  return {
    title: 'Test1',
    date: '2020-04-38',
    tags: <string[]>[],
    translations: <BlogPostTranslation[]>[],
    markdown: ''
  } as BlogPost;
}

export interface Project {
  name: string;
  url: string;
  description: string;
  stars: number;
  language: string;
}

export function getProjects() {
  const fileNames = fs.readdirSync(projectsDirPath);
  const fileContents = fileNames.map((fileName) =>
    fs.readFileSync(path.resolve(projectsDirPath, fileName), 'utf-8')
  );

  return fileContents.map((content) => JSON.parse(content)) as Project[];
}

export interface Talk {
  title: string;
  event: string;
  date: string;
  language: string;
  eventUrl: string;
  presentationUrl?: string | undefined;
  recordingUrl?: string | undefined;
}

export function getTalks() {
  const fileNames = fs.readdirSync(talksDirPath);
  const fileContents = fileNames.map((fileName) =>
    fs.readFileSync(path.resolve(talksDirPath, fileName), 'utf-8')
  );

  return fileContents.map((content) => JSON.parse(content)) as Talk[];
}
