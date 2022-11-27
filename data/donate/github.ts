import { graphql } from '@octokit/graphql';
import type { Donation } from '~/data/donate';
import { bufferIterable } from '~/utils/async';
import { getGitHubToken } from '~/utils/env';

const createClient = () => {
  return graphql.defaults({
    headers: {
      authorization: `token ${getGitHubToken()}`
    }
  });
};

const getSponsorActivities = async function* () {
  const github = createClient();
  let cursor: string | undefined;

  while (true) {
    type QueryResult = {
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
              sponsorshipForViewerAsSponsorable?: {
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

    const data = await github<QueryResult>(
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

    yield* data.viewer.sponsorsActivities.nodes;

    if (!data.viewer.sponsorsActivities.pageInfo.hasNextPage) {
      break;
    }
  }
};

export const getGitHubSponsorsDonations = async function* () {
  const activities = await bufferIterable(getSponsorActivities());
  const sponsors = [...new Set(activities.map((activity) => activity.sponsor.login))];

  for (const sponsor of sponsors) {
    // Sum up all one-time donations
    const oneTimeTotal = activities
      .filter(
        (activity) =>
          activity.sponsor.login === sponsor &&
          activity.sponsorsTier.isOneTime &&
          activity.action === 'NEW_SPONSORSHIP'
      )
      .reduce((acc, activity) => acc + activity.sponsorsTier.monthlyPriceInCents / 100, 0);

    // Sum up all monthly donations
    const monthlyTotal = activities
      .filter(
        (activity) =>
          activity.sponsor.login === sponsor &&
          !activity.sponsorsTier.isOneTime &&
          (activity.action === 'NEW_SPONSORSHIP' || activity.action === 'TIER_CHANGE')
      )
      .map((activity) => {
        const periodStart = new Date(activity.timestamp);

        const periodEndActivity = activities.find(
          (otherActivity) =>
            new Date(otherActivity.timestamp) > periodStart &&
            (otherActivity.action === 'CANCELLED_SPONSORSHIP' ||
              otherActivity.action === 'TIER_CHANGE')
        );

        const periodEnd = periodEndActivity ? new Date(periodEndActivity.timestamp) : new Date();

        const periodMonths =
          1 +
          (periodEnd.getFullYear() - periodStart.getFullYear()) * 12 +
          (periodEnd.getMonth() - periodStart.getMonth());

        return (periodMonths * activity.sponsorsTier.monthlyPriceInCents) / 100;
      })
      .reduce((acc, amount) => acc + amount, 0);

    const isPrivate = activities
      .filter((activity) => activity.sponsor.login === sponsor)
      .filter((activity) => activity.action === 'NEW_SPONSORSHIP')
      .map(
        (activity) => activity.sponsor.sponsorshipForViewerAsSponsorable?.privacyLevel === 'PRIVATE'
      )
      .at(-1);

    const donation: Donation = {
      name: !isPrivate ? sponsor : undefined,
      amount: oneTimeTotal + monthlyTotal,
      platform: 'GitHub Sponsors'
    };

    yield donation;
  }
};
