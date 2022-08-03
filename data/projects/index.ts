import fs from 'fs/promises';
import path from 'path';

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
  const entries = await fs.opendir(dirPath);

  for await (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) {
      continue;
    }

    const filePath = path.join(dirPath, entry.name);
    const project: Project = JSON.parse(await fs.readFile(filePath, 'utf8'));

    yield project;
  }
};
