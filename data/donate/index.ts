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
  const HEIGHT = 115;
  const PADDING = 20;

  const medals = ['&#x1F947;', '&#x1F948;', '&#x1F949;'];
  const first = top[0];
  const rest = top.slice(1);

  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const firstBlock = first
    ? `<text x="0" y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="24" fill="#ffffff">${medals[0]}</text>` +
      `<text x="0" y="26" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="bold" fill="#9333ea">${esc(first.name!)}</text>` +
      `<text x="0" y="46" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#9ca3af">$${first.amount.toFixed(0)}</text>`
    : '';

  const restBlock = rest
    .map((d, i) => {
      const rank = i + 2;
      const medal = medals[rank - 1] ?? `#${rank}`;
      const fontSize = rank <= 3 ? 14 : 12;
      const fillColor = rank <= 3 ? '#ffffff' : '#d1d5db';
      const y = PADDING + i * 22;
      return (
        `<text x="0" y="${y}" font-family="'Segoe UI', Arial, sans-serif" font-size="${fontSize}" fill="${fillColor}">` +
        `${medal} ${esc(d.name!)}` +
        `</text>`
      );
    })
    .join('');

  const DIVIDER_X = 215;

  const svg =
    `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">` +
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="#1a1a1a" rx="10" />` +
    `<rect x="${DIVIDER_X}" y="15" width="1" height="${HEIGHT - 30}" fill="#374151" />` +
    `<g transform="translate(${PADDING}, ${PADDING + 12})">` +
    firstBlock +
    `</g>` +
    `<g transform="translate(${DIVIDER_X + 15}, 0)">` +
    restBlock +
    `</g>` +
    `</svg>`;

  await fs.rm(filePath, { force: true });
  await fs.writeFile(filePath, svg, 'utf8');
};
