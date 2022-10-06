import type { Donation } from '@/data/donate';
import { groupBy } from '@/utils/array';
import { bufferIterable } from '@/utils/async';
import { getBuyMeACoffeeToken } from '@/utils/env';
import { formatUrlWithQuery } from '@/utils/url';
import axios from 'axios';

const getSupporters = async function* () {
  let page = 1;

  while (true) {
    // BMAC's rate limits are absolutely absurd, so we'll use a caching layer that I made.
    // https://github.com/Tyrrrz/BMAC-API-Cache
    const url = formatUrlWithQuery('https://bmac-api-cache-server.onrender.com/api/v1/supporters', {
      page: page.toString()
    });

    // https://developers.buymeacoffee.com/#/apireference?id=onetime-supporters-v1supporters
    type ResponsePayload = {
      data: {
        payer_email: string;
        payer_name?: string;
        supporter_name?: string;
        support_visibility: number;
        support_coffees: number;
        support_coffee_price: string;
        is_refunded?: boolean;
      }[];
      last_page: number;
    };

    const response = await axios.get<ResponsePayload>(url, {
      headers: {
        authorization: `Bearer ${getBuyMeACoffeeToken()}`
      },
      validateStatus: () => true
    });

    if (response.status !== 200) {
      throw new Error(
        `Failed to fetch BuyMeACoffee supporters. Status code: ${response.status}. Request URL: ${url}.`
      );
    }

    yield* response.data.data;

    if (page >= response.data.last_page) {
      break;
    }

    page++;
  }
};

export const getBuyMeACoffeeDonations = async function* () {
  // Filter out refunds and project into a simpler structure
  const pledges = (await bufferIterable(getSupporters()))
    .filter((supporter) => !supporter.is_refunded)
    .map((supporter) => {
      const isPrivate = supporter.support_visibility === 0;
      const email = supporter.payer_email;
      const name = supporter.supporter_name || supporter.payer_name;
      const amount = Number(supporter.support_coffee_price) * supporter.support_coffees;

      return {
        isPrivate,
        email,
        name,
        amount
      };
    });

  // Sum up all pledges with the same email
  const pledgesByEmail = groupBy(pledges, (pledge) => pledge.email).map(({ items }) => {
    const last = items.at(-1);
    const amount = items.reduce((acc, cur) => acc + cur.amount, 0);

    return {
      ...last,
      amount
    };
  });

  // Sum up all pledges with the same name
  const pledgesByName = groupBy(pledgesByEmail, (pledge) => pledge.name).map(({ items }) => {
    const last = items.at(-1);
    const amount = items.reduce((acc, cur) => acc + cur.amount, 0);

    return {
      ...last,
      amount
    };
  });

  for (const pledge of pledgesByName) {
    const donation: Donation = {
      name: !pledge.isPrivate ? pledge.name : undefined,
      amount: pledge.amount,
      platform: 'BuyMeACoffee'
    };

    yield donation;
  }
};
