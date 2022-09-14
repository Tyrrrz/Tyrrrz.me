import type { Donation } from '@/data/donate';
import { delay } from '@/utils/async';
import { getPatreonToken } from '@/utils/env';
import { formatUrlWithQuery } from '@/utils/url';
import axios from 'axios';

const getCampaigns = async function* () {
  let cursor = '';

  while (true) {
    const url = formatUrlWithQuery('https://patreon.com/api/oauth2/v2/campaigns', {
      'page[cursor]': cursor
    });

    // https://docs.patreon.com/#get-api-oauth2-v2-identity
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

    const response = await axios.get<ResponsePayload>(url, {
      headers: {
        authorization: `Bearer ${getPatreonToken()}`
      }
    });

    yield* response.data.data;

    if (!response.data.meta.pagination.cursors?.next) {
      break;
    }

    cursor = response.data.meta.pagination.cursors.next;

    // Rate limit: 120 requests per minute
    await delay(500);
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

    // https://docs.patreon.com/#get-api-oauth2-v2-campaigns-campaign_id
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

    const response = await axios.get<ResponsePayload>(url, {
      headers: {
        authorization: `Bearer ${getPatreonToken()}`
      }
    });

    yield* response.data.data;

    if (!response.data.meta.pagination.cursors?.next) {
      break;
    }

    cursor = response.data.meta.pagination.cursors.next;

    // Rate limit: 120 requests per minute
    await delay(500);
  }
};

export const getPatreonDonations = async function* () {
  for await (const campaign of getCampaigns()) {
    for await (const pledge of getPledges(campaign.id)) {
      // Some pledges could be cancelled before the first payment was made
      if (pledge.attributes.lifetime_support_cents <= 0) {
        continue;
      }

      const name = pledge.attributes.full_name;
      const amount = pledge.attributes.lifetime_support_cents / 100;

      const donation: Donation = {
        name,
        amount,
        platform: 'Patreon'
      };

      yield donation;
    }
  }
};
