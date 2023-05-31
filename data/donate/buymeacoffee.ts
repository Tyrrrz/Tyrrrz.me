import { Donation } from '~/data/donate';
import { groupBy } from '~/utils/array';
import { bufferIterable } from '~/utils/async';
import { getBuyMeACoffeeToken, getPrivateDonors } from '~/utils/env';
import { formatUrlWithQuery } from '~/utils/url';

const getSupporters = async function* () {
  let page = 1;

  while (true) {
    const url = formatUrlWithQuery('https://developers.buymeacoffee.com/api/v1/supporters', {
      page: page.toString()
    });

    const response = await fetch(url, {
      headers: {
        'authorization': `Bearer ${getBuyMeACoffeeToken()}`,
        // BMAC's Cloudflare sometimes blocks requests with no user agent
        'user-agent': 'tyrrrz.me'
      }
    });

    if (!response.ok) {
      throw new Error(
        `Request 'GET ${url}' failed. Status: ${response.status}. Body: '${await response.text()}'.`
      );
    }

    // https://developers.buymeacoffee.com/#/apireference?id=onetime-supporters-v1supporters
    type ResponseBody = {
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

    const body: ResponseBody = await response.json();

    yield* body.data;

    if (page >= body.last_page) {
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
      const email = supporter.payer_email;
      const name = supporter.supporter_name || supporter.payer_name;
      const amount = Number(supporter.support_coffee_price) * supporter.support_coffees;

      const isPrivate =
        getPrivateDonors().includes(email) ||
        getPrivateDonors().includes(name || '') ||
        supporter.support_visibility === 0;

      return {
        email,
        name,
        amount,
        isPrivate
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
