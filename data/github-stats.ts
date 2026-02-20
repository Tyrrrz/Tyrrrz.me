import { Octokit } from '@octokit/rest';
import { graphql } from '@octokit/graphql';
import { getGitHubToken, isProduction } from '~/utils/env';

export type GitHubStats = {
  totalStars: number;
  totalRepos: number;
  totalDownloads: number;
  totalIssuesAndPRs: number;
};

const OWNER = 'Tyrrrz';
const RELEASE_BATCH_SIZE = 10;

const createGraphQLClient = () => {
  return graphql.defaults({
    headers: {
      authorization: `token ${getGitHubToken()}`
    }
  });
};

const createRestClient = () => {
  return new Octokit({ auth: getGitHubToken() });
};

export const getGitHubStats = async (): Promise<GitHubStats> => {
  // Use fake data in development
  if (!isProduction()) {
    return {
      totalStars: 16219,
      totalRepos: 91,
      totalDownloads: 28500000,
      totalIssuesAndPRs: 4200
    };
  }

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

  // Fetch release download counts via REST API, batched to avoid rate limits
  let totalDownloads = 0;

  for (let i = 0; i < repoNames.length; i += RELEASE_BATCH_SIZE) {
    const batch = repoNames.slice(i, i + RELEASE_BATCH_SIZE);
    const batchDownloads = await Promise.all(
      batch.map(async (repo) => {
        const releases = await rest.paginate(rest.repos.listReleases, {
          owner: OWNER,
          repo,
          per_page: 100
        });
        return releases.reduce(
          (acc, release) =>
            acc + release.assets.reduce((a, asset) => a + asset.download_count, 0),
          0
        );
      })
    );
    totalDownloads += batchDownloads.reduce((a, b) => a + b, 0);
  }

  return { totalStars, totalRepos, totalDownloads, totalIssuesAndPRs };
};
