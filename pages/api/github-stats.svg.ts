import type { NextApiRequest, NextApiResponse } from 'next';
import { getGitHubStats } from '~/data/github-stats';

const generateImage = (stats: {
  totalStars: number;
  totalRepos: number;
  totalDownloads: number;
  totalIssuesAndPRs: number;
}): string => {
  const width = 440;
  const height = 165;
  const padding = 20;
  const statSpacing = 50;

  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
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
        📦 Repositories
      </text>
      <text x="0" y="20" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">
        ${stats.totalRepos.toLocaleString()}
      </text>
    </g>
    
    <!-- Total Stars -->
    <g transform="translate(${(width - 2 * padding) / 2}, 0)">
      <text x="0" y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#9ca3af">
        ⭐ Total Stars
      </text>
      <text x="0" y="20" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">
        ${stats.totalStars.toLocaleString()}
      </text>
    </g>
    
    <!-- Total Downloads -->
    <g transform="translate(0, ${statSpacing})">
      <text x="0" y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#9ca3af">
        📥 Total Downloads
      </text>
      <text x="0" y="20" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">
        ${stats.totalDownloads.toLocaleString()}
      </text>
    </g>
    
    <!-- Issues & PRs -->
    <g transform="translate(${(width - 2 * padding) / 2}, ${statSpacing})">
      <text x="0" y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#9ca3af">
        🔖 Issues &amp; PRs
      </text>
      <text x="0" y="20" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">
        ${stats.totalIssuesAndPRs.toLocaleString()}
      </text>
    </g>
  </g>
</svg>
  `;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Fetch GitHub stats
    const stats = await getGitHubStats();

    // Generate SVG
    const svg = generateImage(stats);

    // Set appropriate headers
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');

    // Return the SVG
    res.status(200).send(svg);
  } catch (error) {
    console.error('Error generating GitHub stats SVG:', error);
    res.status(500).end();
  }
};

export default handler;
