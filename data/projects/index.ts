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
