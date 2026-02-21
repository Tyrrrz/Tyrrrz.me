import fakes from '~/data/projects/fakes';
import { getGitHubDownloads, getGitHubRepos } from '~/data/projects/github';
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
  totalRepos: number;
  totalStars: number;
  totalDownloads: number;
  totalIssuesAndPRs: number;
};

export const loadProjectStats = async (): Promise<ProjectStats> => {
  // Use fake data in development
  if (!isProduction()) {
    return {
      totalRepos: 91,
      totalStars: 16219,
      totalDownloads: 28500000,
      totalIssuesAndPRs: 4200
    };
  }

  const repos = await getGitHubRepos();
  const totalRepos = repos.length;
  const totalStars = repos.reduce((acc, repo) => acc + (repo.stargazers_count ?? 0), 0);
  const totalIssuesAndPRs = repos.reduce((acc, repo) => acc + (repo.open_issues_count ?? 0), 0);

  // Downloads from GitHub releases + NuGet, matching the projects page
  let totalDownloads = 0;
  for (const repo of repos) {
    totalDownloads += await getGitHubDownloads(repo.name);
    totalDownloads += await getNuGetDownloads(repo.name);
  }

  return { totalRepos, totalStars, totalDownloads, totalIssuesAndPRs };
};
