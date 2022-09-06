import fakes from '@/data/donate/fakes';
import { isProduction } from '@/utils/env';
import { getPatreonDonations } from './patreon';

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

  yield* getPatreonDonations();
};
