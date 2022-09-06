import type { Donation } from '@/data/donate';
import { getPatreonToken } from '@/utils/env';
import { formatUrlWithQuery } from '@/utils/url';
import 'isomorphic-fetch';

const getCampaigns = async function* () {
  let cursor = '';

  while (true) {
    const url = formatUrlWithQuery('https://patreon.com/api/oauth2/v2/campaigns', {
      'page[cursor]': cursor
    });

    const response = await fetch(url, {
      headers: {
        authorization: `Bearer ${getPatreonToken()}`
      }
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch campaigns: ${response.statusText}`);
    }

    type ResponsePayload = {
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

    const payload: ResponsePayload = await response.json();
    yield* payload.data;

    if (!payload.meta.pagination.cursors?.next) {
      break;
    }

    cursor = payload.meta.pagination.cursors.next;
  }
};

const getPledges = async function* (campaignId: string) {
  let cursor = '';

  while (true) {
    const url = formatUrlWithQuery(
      `https://patreon.com/api/oauth2/v2/campaigns/${campaignId}/members`,
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

    if (response.status !== 200) {
      throw new Error(`Failed to fetch pledges: ${response.statusText}`);
    }

    type ResponsePayload = {
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

    const payload: ResponsePayload = await response.json();
    yield* payload.data;

    if (!payload.meta.pagination.cursors?.next) {
      break;
    }

    cursor = payload.meta.pagination.cursors.next;
  }
};

export const getPatreonDonations = async function* () {
  for await (const campaign of getCampaigns()) {
    for await (const pledge of getPledges(campaign.id)) {
      if (pledge.attributes.lifetime_support_cents <= 0) {
        continue;
      }

      const donation: Donation = {
        name: pledge.attributes.full_name,
        amount: pledge.attributes.lifetime_support_cents / 100,
        platform: 'Patreon'
      };

      yield donation;
    }
  }
};
