import { Octokit } from '@octokit/rest';
import { getGitHubToken } from '~/utils/env';

const TOKEN = getGitHubToken();
const OWNER = 'Tyrrrz';

export const getGitHubRepos = async () => {
  if (!TOKEN) {
    return [];
  }

  const github = new Octokit({
    auth: TOKEN
  });

  return await github.paginate(github.repos.listForUser, {
    username: OWNER,
    type: 'owner',
    per_page: 100,
    sort: 'pushed'
  });
};

export const getGitHubDownloads = async (repoName: string) => {
  if (!TOKEN) {
    return 0;
  }

  const github = new Octokit({
    auth: TOKEN
  });

  const releases = await github.paginate(github.repos.listReleases, {
    owner: OWNER,
    repo: repoName,
    per_page: 100
  });

  return releases
    .flatMap((release) => release.assets)
    .reduce((acc, cur) => acc + cur.download_count, 0);
};

export const getGitHubLogoUrl = async (repoName: string) => {
  if (!TOKEN) {
    return undefined;
  }

  try {
    const github = new Octokit({
      auth: TOKEN
    });

    const { data } = await github.repos.getContent({
      owner: OWNER,
      repo: repoName,
      path: 'favicon.png'
    });

    if (!Array.isArray(data) && data.type === 'file' && data.download_url) {
      return data.download_url;
    }
  } catch (err) {
    // Swallow 404 (file doesn't exist); rethrow anything else
    if ((err as { status?: number }).status !== 404) {
      throw err;
    }
  }

  return undefined;
};

export const getGitHubIssuesAndPRsCount = async () => {
  if (!TOKEN) {
    return 0;
  }

  const github = new Octokit({
    auth: TOKEN
  });

  const { data } = await github.search.issuesAndPullRequests({
    q: `user:${OWNER}`,
    per_page: 1
  });

  return data.total_count;
};
