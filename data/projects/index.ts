import fs from 'fs/promises';
import path from 'path';
import fakes from '~/data/projects/fakes';
import { getGitHubDownloads, getGitHubIssuesAndPRsCount, getGitHubRepos } from '~/data/projects/github';
import { getNuGetDownloads } from '~/data/projects/nuget';
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
      await getNuGetDownloads(repo.name)
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

export type ProjectStats = {
  repos: number;
  stars: number;
  downloads: number;
  issuesAndPRs: number;
};

export const loadProjectStats = async (): Promise<ProjectStats> => {
  // Use fake data in development
  if (!isProduction()) {
    return {
      repos: 91,
      stars: 16219,
      downloads: 28500000,
      issuesAndPRs: 4200
    };
  }

  const repos = await getGitHubRepos();
  const repoCount = repos.length;
  const stars = repos.reduce((acc, repo) => acc + (repo.stargazers_count ?? 0), 0);
  const issuesAndPRs = await getGitHubIssuesAndPRsCount();

  // Downloads from GitHub releases + NuGet, matching the projects page
  let downloads = 0;
  for (const repo of repos) {
    downloads += await getGitHubDownloads(repo.name);
    downloads += await getNuGetDownloads(repo.name);
  }

  return { repos: repoCount, stars, downloads, issuesAndPRs };
};

export const publishProjectsSvg = async () => {
  const filePath = path.resolve(process.cwd(), 'public', 'projects.svg');

  const { repos, stars, downloads, issuesAndPRs } = await loadProjectStats();

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
