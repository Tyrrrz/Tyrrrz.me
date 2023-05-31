import { graphql } from '@octokit/graphql';
import { Donation } from '~/data/donate';
import { distinctBy } from '~/utils/array';
import { bufferIterable } from '~/utils/async';
import { getGitHubToken, getPrivateDonors } from '~/utils/env';

// Test here:
// https://docs.github.com/en/graphql/overview/explorer

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

  const sponsors = distinctBy(
    activities.map((activity) => activity.sponsor),
    (sponsor) => sponsor.login
  );

  for (const sponsor of sponsors) {
    // Sum up all one-time donations
    const oneTimeTotal = activities
      .filter(
        (activity) =>
          activity.action === 'NEW_SPONSORSHIP' &&
          activity.sponsor.login === sponsor.login &&
          activity.sponsorsTier.isOneTime
      )
      .reduce((acc, activity) => acc + activity.sponsorsTier.monthlyPriceInCents / 100, 0);

    // Sum up all monthly donations
    const monthlyTotal = activities
      .filter(
        (activity) =>
          (activity.action === 'NEW_SPONSORSHIP' || activity.action === 'TIER_CHANGE') &&
          activity.sponsor.login === sponsor.login &&
          !activity.sponsorsTier.isOneTime
      )
      .map((activity) => {
        const periodStart = new Date(activity.timestamp);

        const periodEndActivity = activities.find(
          (otherActivity) =>
            (otherActivity.action === 'CANCELLED_SPONSORSHIP' ||
              otherActivity.action === 'NEW_SPONSORSHIP' ||
              otherActivity.action === 'TIER_CHANGE') &&
            otherActivity.sponsor.login === sponsor.login &&
            !otherActivity.sponsorsTier.isOneTime &&
            new Date(otherActivity.timestamp) > periodStart
        );

        const periodEnd = periodEndActivity ? new Date(periodEndActivity.timestamp) : new Date();

        const periodMonths =
          1 +
          (periodEnd.getFullYear() - periodStart.getFullYear()) * 12 +
          (periodEnd.getMonth() - periodStart.getMonth());

        return (periodMonths * activity.sponsorsTier.monthlyPriceInCents) / 100;
      })
      .reduce((acc, amount) => acc + amount, 0);

    const isPrivate =
      getPrivateDonors().includes(sponsor.login) ||
      getPrivateDonors().includes(sponsor.name) ||
      !!activities
        .filter((activity) => activity.action === 'NEW_SPONSORSHIP')
        .filter((activity) => activity.sponsor.login === sponsor.login)
        .map(
          (activity) =>
            activity.sponsor.sponsorshipForViewerAsSponsorable?.privacyLevel === 'PRIVATE'
        )
        .at(-1);

    const name = sponsor.name || sponsor.login;
    const amount = oneTimeTotal + monthlyTotal;

    const donation: Donation = {
      name: !isPrivate ? name : undefined,
      amount,
      platform: 'GitHub Sponsors'
    };

    yield donation;
  }
};
