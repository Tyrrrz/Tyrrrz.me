import { graphql } from '@octokit/graphql';
import { getGitHubToken, isProduction } from '~/utils/env';

export type GitHubStats = {
  totalStars: number;
  totalRepos: number;
  totalDownloads: number;
  totalIssuesAndPRs: number;
};

const createGraphQLClient = () => {
  return graphql.defaults({
    headers: {
      authorization: `token ${getGitHubToken()}`
    }
  });
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

  // Fetch all repositories with pagination to get accurate star count
  let hasNextPage = true;
  let cursor: string | null = null;
  let totalStars = 0;
  let totalRepos = 0;
  let totalDownloads = 0;
  let totalIssuesAndPRs = 0;

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
            stargazers: {
              totalCount: number;
            };
            issues: {
              totalCount: number;
            };
            pullRequests: {
              totalCount: number;
            };
            releases: {
              nodes: Array<{
                releaseAssets: {
                  nodes: Array<{
                    downloadCount: number;
                  }>;
                };
              }>;
            };
          }>;
        };
      };
    } = await client(
      `
      query($cursor: String) {
        user(login: "Tyrrrz") {
          repositories(first: 100, after: $cursor, ownerAffiliations: OWNER) {
            totalCount
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              stargazers {
                totalCount
              }
              issues(states: [OPEN, CLOSED]) {
                totalCount
              }
              pullRequests(states: [OPEN, CLOSED]) {
                totalCount
              }
              releases(first: 100) {
                nodes {
                  releaseAssets(first: 100) {
                    nodes {
                      downloadCount
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
      { cursor }
    );

    const repos = result.user.repositories.nodes;
    totalStars += repos.reduce((acc: number, repo) => acc + repo.stargazers.totalCount, 0);
    totalRepos = result.user.repositories.totalCount;
    totalIssuesAndPRs += repos.reduce(
      (acc: number, repo) => acc + repo.issues.totalCount + repo.pullRequests.totalCount,
      0
    );
    totalDownloads += repos.reduce(
      (acc: number, repo) =>
        acc +
        // Note: limited to first 100 releases and 100 assets per release;
        // repos with more releases/assets may have incomplete download counts.
        repo.releases.nodes.reduce(
          (releaseAcc, release) =>
            releaseAcc +
            release.releaseAssets.nodes.reduce(
              (assetAcc, asset) => assetAcc + asset.downloadCount,
              0
            ),
          0
        ),
      0
    );

    hasNextPage = result.user.repositories.pageInfo.hasNextPage;
    cursor = result.user.repositories.pageInfo.endCursor;
  }

  return {
    totalStars,
    totalRepos,
    totalDownloads,
    totalIssuesAndPRs
  };
};
