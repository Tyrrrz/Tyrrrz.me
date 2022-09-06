import { getGitHubToken } from '@/utils/env';
import { graphql } from '@octokit/graphql';

const createClient = () => {
  return graphql.defaults({
    headers: {
      authorization: `token ${getGitHubToken()}`
    }
  });
};

export type GitHubSponsor = {
  name: string;
  isPrivate: boolean;
  amount: number;
};

const getSponsorActivities = async function* () {
  const github = createClient();
  let cursor: string | undefined;

  while (true) {
    type ResponsePayload = {
      viewer: {
        sponsorsActivities: {
          pageInfo: {
            endCursor: string;
            hasNextPage: boolean;
          };
          nodes: {
            action:
              | 'NEW_SPONSORSHIP'
              | 'CANCELLED_SPONSORSHIP'
              | 'TIER_CHANGE'
              | 'REFUND'
              | 'PENDING_CHANGE'
              | 'SPONSOR_MATCH_DISABLED';
            timestamp: string;
            sponsor: {
              login: string;
              name: string;
              sponsorshipForViewerAsSponsorable: {
                privacyLevel: 'PUBLIC' | 'PRIVATE';
              };
            };
            sponsorsTier: {
              isOneTime: boolean;
              monthlyPriceInCents: number;
            };
          }[];
        };
      };
    };

    const payload = await github<ResponsePayload>(
      `
      query($cursor: String) {
        viewer {
          sponsorsActivities(after: $cursor, first: 100, period: ALL) {
            pageInfo {
              endCursor
              hasNextPage
            }
            nodes {
              action
              timestamp
              sponsor {
                ... on User {
                  login
                  name
                  sponsorshipForViewerAsSponsorable {
                    privacyLevel
                  }
                }
                ... on Organization {
                  login
                  name
                  sponsorshipForViewerAsSponsorable {
                    privacyLevel
                  }
                }
              }
              sponsorsTier {
                isOneTime
                monthlyPriceInCents
              }
            }
          }
        }
      }`,
      { cursor }
    );

    yield* payload.viewer.sponsorsActivities.nodes;

    if (!payload.viewer.sponsorsActivities.pageInfo.hasNextPage) {
      break;
    }
  }
};

export const getGitHubSponsors = async function* () {
  // Calculate the total amount of money donated by each sponsor
  const sponsorAmounts = new Map<string, number>();
  for await (const activity of getSponsorActivities()) {
    if (activity.action !== 'NEW_SPONSORSHIP') {
      continue;
    }

    const sponsor = activity.sponsor.login;
    const amount = activity.sponsorsTier.monthlyPriceInCents;

    sponsorAmounts.set(sponsor, (sponsorAmounts.get(sponsor) || 0) + amount);
  }
};
