import { GetServerSideProps, NextPage } from 'next';
import { loadProjectStats } from '~/data/projects';

const WIDTH = 440;
const HEIGHT = 165;
const PADDING = 20;
const STAT_SPACING = 50;
const COLUMN_WIDTH = (WIDTH - 2 * PADDING) / 2;

// This component is never rendered — getServerSideProps sends the response directly
const ProjectsSvg: NextPage = () => null;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const { repos, stars, downloads, issuesAndPRs } = await loadProjectStats();

  const svg =
    `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">` +
    `<defs>` +
    `<linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">` +
    `<stop offset="0%" style="stop-color:#9333ea;stop-opacity:1" />` +
    `<stop offset="100%" style="stop-color:#c084fc;stop-opacity:1" />` +
    `</linearGradient>` +
    `</defs>` +
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="#1a1a1a" rx="10" />` +
    `<text x="${WIDTH / 2}" y="${PADDING + 20}" font-family="'Segoe UI', Arial, sans-serif" font-size="24" font-weight="bold" fill="url(#gradient)" text-anchor="middle">GitHub Stats</text>` +
    `<g transform="translate(${PADDING}, ${PADDING + 50})">` +
    `<g>` +
    `<text x="0" y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#9ca3af">&#x1F4E6; Repositories</text>` +
    `<text x="0" y="20" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">${repos.toLocaleString()}</text>` +
    `</g>` +
    `<g transform="translate(${COLUMN_WIDTH}, 0)">` +
    `<text x="0" y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#9ca3af">&#x2B50; Stars</text>` +
    `<text x="0" y="20" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">${stars.toLocaleString()}</text>` +
    `</g>` +
    `<g transform="translate(0, ${STAT_SPACING})">` +
    `<text x="0" y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#9ca3af">&#x1F4E5; Downloads</text>` +
    `<text x="0" y="20" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">${downloads.toLocaleString()}</text>` +
    `</g>` +
    `<g transform="translate(${COLUMN_WIDTH}, ${STAT_SPACING})">` +
    `<text x="0" y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#9ca3af">&#x1F516; Issues &amp; PRs</text>` +
    `<text x="0" y="20" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">${issuesAndPRs.toLocaleString()}</text>` +
    `</g>` +
    `</g>` +
    `</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.end(svg);

  return { props: {} };
};

export default ProjectsSvg;
