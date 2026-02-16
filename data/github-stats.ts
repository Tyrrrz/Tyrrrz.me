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

  // Fetch user statistics using GitHub GraphQL API
  const result: any = await client(`
    query {
      user(login: "Tyrrrz") {
        repositories(first: 100, ownerAffiliations: OWNER, orderBy: {field: STARGAZERS, direction: DESC}) {
          totalCount
          nodes {
            stargazers {
              totalCount
            }
          }
        }
        contributionsCollection {
          totalCommitContributions
          totalIssueContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
          restrictedContributionsCount
        }
        pullRequests {
          totalCount
        }
        issues {
          totalCount
        }
      }
    }
  `);

  const repos = result.user.repositories.nodes;
  const totalStars = repos.reduce(
    (acc: number, repo: any) => acc + repo.stargazers.totalCount,
    0
  );
  const contributions = result.user.contributionsCollection;

  return {
    totalStars,
    totalRepos: result.user.repositories.totalCount,
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
