import { graphql } from '@octokit/graphql';
import { getGitHubToken, isProduction } from '~/utils/env';

export type GitHubStats = {
  totalStars: number;
  totalRepos: number;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  totalContributions: number;
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
      totalStars: 15000,
      totalRepos: 85,
      totalCommits: 12500,
      totalPRs: 850,
      totalIssues: 420,
      totalContributions: 14000
    };
  }

  const client = createGraphQLClient();

  // Fetch all repositories with pagination to get accurate star count
  let hasNextPage = true;
  let cursor: string | null = null;
  let totalStars = 0;
  let totalRepos = 0;

  while (hasNextPage) {
    const result: any = await client(
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
            }
          }
        }
      }
    `,
      { cursor }
    );

    const repos = result.user.repositories.nodes;
    totalStars += repos.reduce((acc: number, repo: any) => acc + repo.stargazers.totalCount, 0);
    totalRepos = result.user.repositories.totalCount;

    hasNextPage = result.user.repositories.pageInfo.hasNextPage;
    cursor = result.user.repositories.pageInfo.endCursor;
  }

  // Fetch contribution statistics for current year
  const statsResult: any = await client(`
    query {
      user(login: "Tyrrrz") {
        contributionsCollection {
          totalCommitContributions
          totalIssueContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
          restrictedContributionsCount
        }
      }
    }
  `);

  const contributions = statsResult.user.contributionsCollection;

  return {
    totalStars,
    totalRepos,
    totalCommits: contributions.totalCommitContributions,
    totalPRs: contributions.totalPullRequestContributions,
    totalIssues: contributions.totalIssueContributions,
    totalContributions:
      contributions.totalCommitContributions +
      contributions.totalIssueContributions +
      contributions.totalPullRequestContributions +
      contributions.totalPullRequestReviewContributions +
      contributions.restrictedContributionsCount
  };
};
