import fs from 'fs/promises';
import path from 'path';
import fakes from '~/data/projects/fakes';
import { getDockerDownloads } from '~/data/projects/docker';
import { getGitHubDownloads, getGitHubIssuesAndPRsCount, getGitHubRepos } from '~/data/projects/github';
import { getNuGetDownloads } from '~/data/projects/nuget';
import { bufferIterable } from '~/utils/async';
import { isProduction } from '~/utils/env';

export type Project = {
  name: string;
  url: string;
  archived: boolean;
  description?: string;
  homepageUrl?: string;
  stars: number;
  downloads: number;
  language?: string;
};

export const loadProjects = async function* () {
  // Use fake data in development
  if (!isProduction()) {
    yield* fakes;
    return;
  }

  for (const repo of await getGitHubRepos()) {
    if (!repo.stargazers_count || repo.stargazers_count < 35) {
      continue;
    }

    const downloads = [
      await getGitHubDownloads(repo.name),
      await getNuGetDownloads(repo.name),
      // NPM keeps blocking our requests as suspicious.
      // It's fine to ignore it for now, seeing as we have very few NPM packages.
      // await getNpmDownloads(repo.name),
      await getDockerDownloads(repo.name)
    ].reduce((acc, cur) => acc + cur, 0);

    const project: Project = {
      name: repo.name,
      url: repo.html_url,
      archived: repo.archived || false,
      description: repo.description || undefined,
      homepageUrl: repo.homepage || undefined,
      stars: repo.stargazers_count || 0,
      downloads,
      language: repo.language || undefined
    };

    yield project;
  }
};

export const publishProjectStats = async () => {
  const filePath = path.resolve(process.cwd(), 'public', 'projects.svg');

  const projects = await bufferIterable(loadProjects());
  const repos = projects.length;
  const stars = projects.reduce((acc, p) => acc + p.stars, 0);
  const downloads = projects.reduce((acc, p) => acc + p.downloads, 0);
  const issuesAndPRs = isProduction() ? await getGitHubIssuesAndPRsCount() : 4200;

  const WIDTH = 440;
  const HEIGHT = 115;
  const PADDING = 20;
  const STAT_SPACING = 50;
  const COLUMN_WIDTH = (WIDTH - 2 * PADDING) / 2;

  const svg =
    `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">` +
    `<defs>` +
    `<linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">` +
    `<stop offset="0%" style="stop-color:#9333ea;stop-opacity:1" />` +
    `<stop offset="100%" style="stop-color:#c084fc;stop-opacity:1" />` +
    `</linearGradient>` +
    `</defs>` +
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="#1a1a1a" rx="10" />` +
    `<g transform="translate(${PADDING}, ${PADDING + 5})">` +
    `<g>` +
    `<text x="0" y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#9ca3af">&#x1F4E6; Repositories</text>` +
    `<text x="0" y="20" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">${repos.toLocaleString()}</text>` +
    `</g>` +
    `<g transform="translate(${COLUMN_WIDTH}, 0)">` +
    `<text x="0" y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#9ca3af">&#x2B50; Stars</text>` +
    `<text x="0" y="20" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">${stars.toLocaleString()}</text>` +
    `</g>` +
    `<g transform="translate(0, ${STAT_SPACING})">` +
    `<text x="0" y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#9ca3af">&#x1F4E5; Downloads</text>` +
    `<text x="0" y="20" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">${downloads.toLocaleString()}</text>` +
    `</g>` +
    `<g transform="translate(${COLUMN_WIDTH}, ${STAT_SPACING})">` +
    `<text x="0" y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#9ca3af">&#x1F516; Issues &amp; PRs</text>` +
    `<text x="0" y="20" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">${issuesAndPRs.toLocaleString()}</text>` +
    `</g>` +
    `</g>` +
    `</svg>`;

  await fs.rm(filePath, { force: true });
  await fs.writeFile(filePath, svg);
};
