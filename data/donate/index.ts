import fs from 'fs/promises';
import path from 'path';
import { getBuyMeACoffeeDonations } from '~/data/donate/buymeacoffee';
import fakes from '~/data/donate/fakes';
import { getGitHubSponsorsDonations } from '~/data/donate/github';
import { getPatreonDonations } from '~/data/donate/patreon';
import { bufferIterable } from '~/utils/async';
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

export const publishDonationStats = async () => {
  const filePath = path.resolve(process.cwd(), 'public', 'donate.svg');

  const donations = await bufferIterable(loadDonations());
  const top = donations
    .filter((d) => d.name)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const WIDTH = 440;
  const HEIGHT = 190;

  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Each rank is a separate variable so ${...} expressions are embedded in the
  // SVG template literal chain, preventing the minifier from constant-folding
  // adjacent string segments into a plain (non-backtick) string.
  const first = top[0]
    ? `<text x="220" y="72" font-family="'Segoe UI', Arial, sans-serif" font-size="28" font-weight="800" fill="#F5C542" text-anchor="middle" letter-spacing="1">&#x2B50; ${esc(top[0].name!)}</text>` +
      `<text x="220" y="89" font-family="'Segoe UI', Arial, sans-serif" font-size="12" fill="#9ca3af" text-anchor="middle">$${top[0].amount.toFixed(0)}</text>`
    : '';

  const second = top[1]
    ? `<text x="110" y="121" font-family="'Segoe UI', Arial, sans-serif" font-size="22" font-weight="600" fill="#ffffff" text-anchor="middle">&#x1F948; ${esc(top[1].name!)}</text>` +
      `<text x="110" y="135" font-family="'Segoe UI', Arial, sans-serif" font-size="11" fill="#9ca3af" text-anchor="middle">$${top[1].amount.toFixed(0)}</text>`
    : '';

  const third = top[2]
    ? `<text x="330" y="121" font-family="'Segoe UI', Arial, sans-serif" font-size="22" font-weight="600" fill="#ffffff" text-anchor="middle">&#x1F949; ${esc(top[2].name!)}</text>` +
      `<text x="330" y="135" font-family="'Segoe UI', Arial, sans-serif" font-size="11" fill="#9ca3af" text-anchor="middle">$${top[2].amount.toFixed(0)}</text>`
    : '';

  const fourth = top[3]
    ? `<text x="110" y="162" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="500" fill="#9ca3af" text-anchor="middle">${esc(top[3].name!)}</text>` +
      `<text x="110" y="175" font-family="'Segoe UI', Arial, sans-serif" font-size="11" fill="#6b7280" text-anchor="middle">$${top[3].amount.toFixed(0)}</text>`
    : '';

  const fifth = top[4]
    ? `<text x="330" y="162" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="500" fill="#9ca3af" text-anchor="middle">${esc(top[4].name!)}</text>` +
      `<text x="330" y="175" font-family="'Segoe UI', Arial, sans-serif" font-size="11" fill="#6b7280" text-anchor="middle">$${top[4].amount.toFixed(0)}</text>`
    : '';

  const svg =
    `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">` +
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="#1a1a1a" rx="10" />` +
    `<text x="220" y="24" font-family="'Segoe UI', Arial, sans-serif" font-size="12" fill="#9ca3af" text-anchor="middle" letter-spacing="2">TOP DONORS</text>${first}${second}${third}${fourth}${fifth}` +
    `</svg>`;

  await fs.rm(filePath, { force: true });
  await fs.writeFile(filePath, svg, 'utf8');
};
