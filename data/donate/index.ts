import { getBuyMeACoffeeDonations } from '~/data/donate/buymeacoffee';
import fakes from '~/data/donate/fakes';
import { getGitHubSponsorsDonations } from '~/data/donate/github';
import { getPatreonDonations } from '~/data/donate/patreon';
import { isProduction } from '~/utils/env';

export type Donation = {
  name?: string;
  amount: number;
  platform: string;
};

export const loadDonations = async function* () {
  // Use fake data in development
  if (!isProduction()) {
    yield* fakes;
    return;
  }

  yield* getGitHubSponsorsDonations();
  yield* getPatreonDonations();
  yield* getBuyMeACoffeeDonations();
};
