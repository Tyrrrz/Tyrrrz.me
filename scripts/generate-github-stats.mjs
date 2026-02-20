// Generates public/github-stats.svg at build time.
// Requires GITHUB_TOKEN to be set; falls back to fake data otherwise.

import { graphql as createGraphQL } from '@octokit/graphql';
import { Octokit } from '@octokit/rest';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// SVG generation
// ---------------------------------------------------------------------------

/** @param {{ totalRepos: number; totalStars: number; totalDownloads: number; totalIssuesAndPRs: number }} stats */
const generateSvg = (stats) => {
  const width = 440;
  const height = 165;
  const padding = 20;
  const statSpacing = 50;

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#9333ea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#c084fc;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="#1a1a1a" rx="10"/>

  <!-- Title -->
  <text x="${width / 2}" y="${padding + 20}"
        font-family="'Segoe UI', Arial, sans-serif"
        font-size="24"
        font-weight="bold"
        fill="url(#gradient)"
        text-anchor="middle">
    GitHub Stats
  </text>

  <!-- Stats Grid -->
  <g transform="translate(${padding}, ${padding + 50})">
    <!-- Repositories -->
    <g>
      <text x="0" y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#9ca3af">
        &#x1F4E6; Repositories
      </text>
      <text x="0" y="20" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">
        ${stats.totalRepos.toLocaleString()}
      </text>
    </g>

    <!-- Total Stars -->
    <g transform="translate(${(width - 2 * padding) / 2}, 0)">
      <text x="0" y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#9ca3af">
        &#x2B50; Total Stars
      </text>
      <text x="0" y="20" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">
        ${stats.totalStars.toLocaleString()}
      </text>
    </g>

    <!-- Total Downloads -->
    <g transform="translate(0, ${statSpacing})">
      <text x="0" y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#9ca3af">
        &#x1F4E5; Total Downloads
      </text>
      <text x="0" y="20" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">
        ${stats.totalDownloads.toLocaleString()}
      </text>
    </g>

    <!-- Issues & PRs -->
    <g transform="translate(${(width - 2 * padding) / 2}, ${statSpacing})">
      <text x="0" y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#9ca3af">
        &#x1F516; Issues &amp; PRs
      </text>
      <text x="0" y="20" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">
        ${stats.totalIssuesAndPRs.toLocaleString()}
      </text>
    </g>
  </g>
</svg>`;
};

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

const OWNER = 'Tyrrrz';
const RELEASE_BATCH_SIZE = 10;

const getStats = async () => {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    console.log('GITHUB_TOKEN not set — using fake data.');
    return {
      totalRepos: 91,
      totalStars: 16219,
      totalDownloads: 28500000,
      totalIssuesAndPRs: 4200
    };
  }

  const gql = createGraphQL.defaults({
    headers: { authorization: `token ${token}` }
  });
  const rest = new Octokit({ auth: token });

  // -------------------------------------------------------------------------
  // 1. Fetch all public repos via GraphQL (paginated)
  // -------------------------------------------------------------------------
  let hasNextPage = true;
  let cursor = null;
  let totalStars = 0;
  let totalRepos = 0;
  let totalIssuesAndPRs = 0;
  /** @type {string[]} */
  const repoNames = [];

  while (hasNextPage) {
    /** @type {any} */
    const result = await gql(
      `
      query($cursor: String) {
        user(login: "${OWNER}") {
          repositories(
            first: 100
            after: $cursor
            ownerAffiliations: OWNER
            privacy: PUBLIC
          ) {
            totalCount
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              name
              stargazers { totalCount }
              issues(states: [OPEN, CLOSED]) { totalCount }
              pullRequests(states: [OPEN, CLOSED]) { totalCount }
            }
          }
        }
      }
    `,
      { cursor }
    );

    const repos = result.user.repositories.nodes;
    totalRepos = result.user.repositories.totalCount;
    totalStars += repos.reduce((acc, repo) => acc + repo.stargazers.totalCount, 0);
    totalIssuesAndPRs += repos.reduce(
      (acc, repo) => acc + repo.issues.totalCount + repo.pullRequests.totalCount,
      0
    );
    repoNames.push(...repos.map((repo) => repo.name));

    hasNextPage = result.user.repositories.pageInfo.hasNextPage;
    cursor = result.user.repositories.pageInfo.endCursor;
  }

  // -------------------------------------------------------------------------
  // 2. Fetch release download counts via REST, in batches to avoid rate limits
  // -------------------------------------------------------------------------
  let totalDownloads = 0;

  for (let i = 0; i < repoNames.length; i += RELEASE_BATCH_SIZE) {
    const batch = repoNames.slice(i, i + RELEASE_BATCH_SIZE);
    const batchDownloads = await Promise.all(
      batch.map(async (repo) => {
        const releases = await rest.paginate(rest.repos.listReleases, {
          owner: OWNER,
          repo,
          per_page: 100
        });
        return releases.reduce(
          (acc, release) =>
            acc + release.assets.reduce((a, asset) => a + asset.download_count, 0),
          0
        );
      })
    );
    totalDownloads += batchDownloads.reduce((a, b) => a + b, 0);
  }

  return { totalRepos, totalStars, totalDownloads, totalIssuesAndPRs };
};

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

const stats = await getStats();
const svg = generateSvg(stats);
const outPath = join(__dirname, '..', 'public', 'github-stats.svg');
writeFileSync(outPath, svg, 'utf8');
console.log(`Generated ${outPath}`);
