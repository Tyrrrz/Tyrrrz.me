import fs from 'fs/promises';
import path from 'path';

export type Donation = {
  name: string;
  amount: number;
  platform: string;
};

export const loadDonations = async function* () {
  const filePath = path.resolve(process.cwd(), 'data', 'donate', 'donations.json');
  const donations: Donation[] = JSON.parse(await fs.readFile(filePath, 'utf8'));

  for (const donation of donations) {
    yield donation;
  }
};
