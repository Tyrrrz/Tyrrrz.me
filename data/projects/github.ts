import { Octokit } from '@octokit/rest';
import { getNuGetDownloads } from '~/data/projects/nuget';
import { getGitHubToken, isProduction } from '~/utils/env';

const OWNER = 'Tyrrrz';

const createRestClient = () => {
  return new Octokit({
    auth: getGitHubToken()
  });
};

export const getGitHubRepos = async () => {
  const github = createRestClient();

  return await github.paginate(github.repos.listForUser, {
    username: OWNER,
    type: 'owner',
    per_page: 100,
    sort: 'pushed'
  });
};

export const getGitHubDownloads = async (repositoryName: string) => {
  const github = createRestClient();

  const releases = await github.paginate(github.repos.listReleases, {
    owner: OWNER,
    repo: repositoryName,
    per_page: 100
  });

  return releases
    .flatMap((release) => release.assets)
    .reduce((acc, cur) => acc + cur.download_count, 0);
};

export type GitHubStats = {
  totalRepos: number;
  totalStars: number;
  totalDownloads: number;
  totalIssuesAndPRs: number;
};

export const getGitHubStats = async (): Promise<GitHubStats> => {
  // Use fake data in development
  if (!isProduction()) {
    return {
      totalRepos: 91,
      totalStars: 16219,
      totalDownloads: 28500000,
      totalIssuesAndPRs: 4200
    };
  }

  const rest = createRestClient();

  // Fetch all public repos to aggregate totals
  const repos = await getGitHubRepos();
  const totalRepos = repos.length;
  const totalStars = repos.reduce((acc, repo) => acc + (repo.stargazers_count ?? 0), 0);

  // Total issues and PRs (open and closed) via the search API
  const { data: issueSearch } = await rest.search.issuesAndPullRequests({
    q: `user:${OWNER}`,
    per_page: 1
  });
  const totalIssuesAndPRs = issueSearch.total_count;

  // Downloads from GitHub releases + NuGet (matching the projects page)
  let totalDownloads = 0;
  for (const repo of repos) {
    totalDownloads += await getGitHubDownloads(repo.name);
    totalDownloads += await getNuGetDownloads(repo.name);
  }

  return { totalRepos, totalStars, totalDownloads, totalIssuesAndPRs };
};
