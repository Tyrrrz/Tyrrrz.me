import type { Donation } from '@/data/donate';
import { bufferIterable, delay } from '@/utils/async';
import { getBuyMeACoffeeToken } from '@/utils/env';
import { formatUrlWithQuery } from '@/utils/url';
import axios from 'axios';

const getSupporters = async function* () {
  let page = 1;

  while (true) {
    const url = formatUrlWithQuery('https://developers.buymeacoffee.com/api/v1/supporters', {
      page: page.toString()
    });

    // https://developers.buymeacoffee.com/#/apireference?id=onetime-supporters-v1supporters
    type ResponsePayload = {
      data: {
        payer_name: string;
        support_visibility: number;
        support_coffees: number;
        support_coffee_price: string;
        supporter_name?: string;
        is_refunded?: boolean;
      }[];
      last_page: number;
    };

    const response = await axios.get<ResponsePayload>(url, {
      headers: {
        Authorization: `Bearer ${getBuyMeACoffeeToken()}`
      }
    });

    yield* response.data.data;

    if (page >= response.data.last_page) {
      break;
    }

    page++;

    // Rate limit: 15 requests per minute
    await delay(4000);
  }
};

export const getBuyMeACoffeeDonations = async function* () {
  const supporters = await bufferIterable(getSupporters());

  const groupedSupporters = [
    ...supporters
      .reduce((acc, supporter) => {
        // Skip refunded
        if (supporter.is_refunded) {
          return acc;
        }

        const name = supporter.supporter_name || supporter.payer_name;

        acc.set(name, {
          ...supporter,
          support_coffees: (acc.get(name)?.support_coffees || 0) + supporter.support_coffees
        });

        return acc;
      }, new Map<string, typeof supporters[0]>())
      .values()
  ];

  for (const supporter of groupedSupporters) {
    const name =
      supporter.support_visibility !== 0
        ? supporter.supporter_name || supporter.payer_name
        : undefined;

    const amount = Number(supporter.support_coffee_price) * supporter.support_coffees;

    const donation: Donation = {
      name,
      amount,
      platform: 'BuyMeACoffee'
    };

    yield donation;
  }
};
