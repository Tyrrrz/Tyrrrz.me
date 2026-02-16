import { graphql } from '@octokit/graphql';
import { getGitHubToken, isProduction } from '~/utils/env';

export type GitHubStats = {
  totalStars: number;
  totalRepos: number;
  yearlyCommits: number;
  yearlyPRs: number;
  yearlyIssues: number;
  yearlyContributions: number;
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
      yearlyCommits: 1054,
      yearlyPRs: 35,
      yearlyIssues: 12,
      yearlyContributions: 1178
    };
  }

  const client = createGraphQLClient();

  // Fetch all repositories with pagination to get accurate star count
  let hasNextPage = true;
  let cursor: string | null = null;
  let totalStars = 0;
  let totalRepos = 0;

  type RepoQueryResult = {
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
        }>;
      };
    };
  };

  while (hasNextPage) {
    const result: RepoQueryResult = await client(
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
    totalStars += repos.reduce((acc: number, repo) => acc + repo.stargazers.totalCount, 0);
    totalRepos = result.user.repositories.totalCount;

    hasNextPage = result.user.repositories.pageInfo.hasNextPage;
    cursor = result.user.repositories.pageInfo.endCursor;
  }

  // Fetch contribution statistics for current year
  type ContributionQueryResult = {
    user: {
      contributionsCollection: {
        totalCommitContributions: number;
        totalIssueContributions: number;
        totalPullRequestContributions: number;
        totalPullRequestReviewContributions: number;
        restrictedContributionsCount: number;
      };
    };
  };

  const statsResult: ContributionQueryResult = await client(`
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
    yearlyCommits: contributions.totalCommitContributions,
    yearlyPRs: contributions.totalPullRequestContributions,
    yearlyIssues: contributions.totalIssueContributions,
    yearlyContributions:
      contributions.totalCommitContributions +
      contributions.totalIssueContributions +
      contributions.totalPullRequestContributions +
      contributions.totalPullRequestReviewContributions +
      contributions.restrictedContributionsCount
  };
};
