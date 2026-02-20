import { Octokit } from '@octokit/rest';
import { getGitHubToken } from '~/utils/env';

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

export const getGitHubIssuesAndPRsCount = async () => {
  const github = createRestClient();

  const { data } = await github.search.issuesAndPullRequests({
    q: `user:${OWNER}`,
    per_page: 1
  });

  return data.total_count;
};
