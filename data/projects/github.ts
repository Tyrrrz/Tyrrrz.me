import { getGitHubToken } from '@/utils/env';
import { Octokit } from '@octokit/rest';

const github = new Octokit({
  auth: getGitHubToken()
});

export const getGitHubRepos = async () => {
  return await github.paginate(github.repos.listForUser, {
    username: 'Tyrrrz',
    type: 'owner',
    per_page: 100,
    sort: 'pushed'
  });
};

export const getGitHubDownloads = async (repo: string) => {
  const releases = await github.paginate(github.repos.listReleases, {
    owner: 'Tyrrrz',
    repo,
    per_page: 100
  });

  return releases
    .flatMap((release) => release.assets)
    .reduce((acc, cur) => acc + cur.download_count, 0);
};
