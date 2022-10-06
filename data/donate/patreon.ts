import type { Donation } from '@/data/donate';
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
      },
      validateStatus: () => true
    });

    if (response.status !== 200) {
      throw new Error(
        `Failed to fetch Patreon campaigns. Status code: ${response.status}. Request URL: ${url}.`
      );
    }

    yield* response.data.data;

    if (!response.data.meta.pagination.cursors?.next) {
      break;
    }

    cursor = response.data.meta.pagination.cursors.next;
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
      },
      validateStatus: () => true
    });

    if (response.status !== 200) {
      throw new Error(
        `Failed to fetch Patreon pledges. Status code: ${response.status}. Request URL: ${url}.`
      );
    }

    yield* response.data.data;

    if (!response.data.meta.pagination.cursors?.next) {
      break;
    }

    cursor = response.data.meta.pagination.cursors.next;
  }
};

export const getPatreonDonations = async function* () {
  for await (const campaign of getCampaigns()) {
    for await (const pledge of getPledges(campaign.id)) {
      // Some pledges could have been cancelled before the first payment was made
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
