import { Octokit } from '@octokit/rest';
import { graphql } from '@octokit/graphql';
import { getGitHubToken } from '~/utils/env';

const OWNER = 'Tyrrrz';

const createRestClient = () => {
  return new Octokit({
    auth: getGitHubToken()
  });
};

const createGraphQLClient = () => {
  return graphql.defaults({
    headers: { authorization: `token ${getGitHubToken()}` }
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
  const client = createGraphQLClient();
  const rest = createRestClient();

  // Fetch all public repositories with pagination
  let hasNextPage = true;
  let cursor: string | null = null;
  let totalStars = 0;
  let totalRepos = 0;
  let totalIssuesAndPRs = 0;
  const repoNames: string[] = [];

  while (hasNextPage) {
    const result: {
      user: {
        repositories: {
          totalCount: number;
          pageInfo: {
            hasNextPage: boolean;
            endCursor: string | null;
          };
          nodes: Array<{
            name: string;
            stargazers: { totalCount: number };
            issues: { totalCount: number };
            pullRequests: { totalCount: number };
          }>;
        };
      };
    } = await client(
      `
      query($cursor: String) {
        user(login: "${OWNER}") {
          repositories(
            first: 100
            after: $cursor
            ownerAffiliations: OWNER
            privacy: PUBLIC
          ) {
            totalCount
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              name
              stargazers { totalCount }
              issues(states: [OPEN, CLOSED]) { totalCount }
              pullRequests(states: [OPEN, CLOSED]) { totalCount }
            }
          }
        }
      }
    `,
      { cursor }
    );

    const repos = result.user.repositories.nodes;
    totalRepos = result.user.repositories.totalCount;
    totalStars += repos.reduce((acc, repo) => acc + repo.stargazers.totalCount, 0);
    totalIssuesAndPRs += repos.reduce(
      (acc, repo) => acc + repo.issues.totalCount + repo.pullRequests.totalCount,
      0
    );
    repoNames.push(...repos.map((repo) => repo.name));

    hasNextPage = result.user.repositories.pageInfo.hasNextPage;
    cursor = result.user.repositories.pageInfo.endCursor;
  }

  // Fetch release download counts (sequential — no concurrency pressure at build time)
  let totalDownloads = 0;

  for (const repo of repoNames) {
    totalDownloads += await getGitHubDownloads(repo);
  }

  return { totalRepos, totalStars, totalDownloads, totalIssuesAndPRs };
};
