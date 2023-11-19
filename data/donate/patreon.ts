import { Donation } from '~/data/donate';
import { getPatreonToken, getPrivateDonors } from '~/utils/env';
import { formatUrlWithQuery } from '~/utils/url';

const getCampaigns = async function* () {
  let cursor = '';

  while (true) {
    // The 'www' part is essential 😒
    const url = formatUrlWithQuery('https://www.patreon.com/api/oauth2/v2/campaigns', {
      'page[cursor]': cursor
    });

    const response = await fetch(url, {
      headers: {
        authorization: `Bearer ${getPatreonToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(
        `Request 'GET ${url}' failed. Status: ${response.status}. Body: '${await response.text()}'.`
      );
    }

    // https://docs.patreon.com/#get-api-oauth2-v2-campaigns
    type ResponseBody = {
      data: {
        id: string;
      }[];
      meta: {
        pagination: {
          cursors?: {
            next?: string;
          };
        };
      };
    };

    const body: ResponseBody = await response.json();

    yield* body.data;

    if (!body.meta.pagination.cursors?.next) {
      break;
    }

    cursor = body.meta.pagination.cursors.next;
  }
};

const getPledges = async function* (campaignId: string) {
  let cursor = '';

  while (true) {
    // The 'www' part is essential 😒
    const url = formatUrlWithQuery(
      `https://www.patreon.com/api/oauth2/v2/campaigns/${campaignId}/members`,
      {
        'page[cursor]': cursor,
        'fields[member]': 'full_name,lifetime_support_cents'
      }
    );

    const response = await fetch(url, {
      headers: {
        authorization: `Bearer ${getPatreonToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(
        `Request 'GET ${url}' failed. Status: ${response.status}. Body: '${await response.text()}'.`
      );
    }

    // https://docs.patreon.com/#get-api-oauth2-v2-campaigns-campaign_id-members
    type ResponseBody = {
      data: {
        id: string;
        attributes: {
          full_name: string;
          lifetime_support_cents: number;
        };
      }[];
      meta: {
        pagination: {
          cursors?: {
            next?: string;
          };
        };
      };
    };

    const body: ResponseBody = await response.json();

    yield* body.data;

    if (!body.meta.pagination.cursors?.next) {
      break;
    }

    cursor = body.meta.pagination.cursors.next;
  }
};

export const getPatreonDonations = async function* () {
  for await (const campaign of getCampaigns()) {
    for await (const pledge of getPledges(campaign.id)) {
      const name = pledge.attributes.full_name;
      const amount = pledge.attributes.lifetime_support_cents / 100;
      const isPrivate = getPrivateDonors().includes(pledge.attributes.full_name);

      // Some pledges could have been cancelled before the first payment was made
      if (amount <= 0) {
        continue;
      }

      const donation: Donation = {
        name: !isPrivate ? name : undefined,
        amount,
        platform: 'Patreon'
      };

      yield donation;
    }
  }
};
