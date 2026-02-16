import type { NextApiRequest, NextApiResponse } from 'next';
import { getGitHubStats } from '~/data/github-stats';

const generateSVG = (stats: {
  totalStars: number;
  totalRepos: number;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  totalContributions: number;
}): string => {
  const width = 500;
  const height = 250;
  const padding = 20;
  const statSpacing = 40;

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
    <!-- Total Stars -->
    <g>
      <text x="0" y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#9ca3af">
        ⭐ Total Stars
      </text>
      <text x="0" y="20" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">
        ${stats.totalStars.toLocaleString()}
      </text>
    </g>
    
    <!-- Total Repositories -->
    <g transform="translate(${(width - 2 * padding) / 2}, 0)">
      <text x="0" y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#9ca3af">
        📦 Repositories
      </text>
      <text x="0" y="20" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">
        ${stats.totalRepos.toLocaleString()}
      </text>
    </g>
    
    <!-- Total Commits (This Year) -->
    <g transform="translate(0, ${statSpacing})">
      <text x="0" y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#9ca3af">
        💻 Commits (This Year)
      </text>
      <text x="0" y="20" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">
        ${stats.totalCommits.toLocaleString()}
      </text>
    </g>
    
    <!-- Total PRs (This Year) -->
    <g transform="translate(${(width - 2 * padding) / 2}, ${statSpacing})">
      <text x="0" y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#9ca3af">
        🔀 PRs (This Year)
      </text>
      <text x="0" y="20" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">
        ${stats.totalPRs.toLocaleString()}
      </text>
    </g>
    
    <!-- Total Issues (This Year) -->
    <g transform="translate(0, ${statSpacing * 2})">
      <text x="0" y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#9ca3af">
        📋 Issues (This Year)
      </text>
      <text x="0" y="20" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">
        ${stats.totalIssues.toLocaleString()}
      </text>
    </g>
    
    <!-- Total Contributions (This Year) -->
    <g transform="translate(${(width - 2 * padding) / 2}, ${statSpacing * 2})">
      <text x="0" y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#9ca3af">
        🎯 Contributions (Year)
      </text>
      <text x="0" y="20" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">
        ${stats.totalContributions.toLocaleString()}
      </text>
    </g>
  </g>
  
  <!-- Footer -->
  <text x="${width / 2}" y="${height - padding / 2}" 
        font-family="'Segoe UI', Arial, sans-serif" 
        font-size="10" 
        fill="#6b7280" 
        text-anchor="middle">
    Generated from tyrrrz.me
  </text>
</svg>
  `.trim();
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Fetch GitHub stats
    const stats = await getGitHubStats();

    // Generate SVG
    const svg = generateSVG(stats);

    // Set appropriate headers
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');

    // Return the SVG
    res.status(200).send(svg);
  } catch (error) {
    console.error('Error generating GitHub stats SVG:', error);
    res.status(500).json({ error: 'Failed to generate GitHub stats' });
  }
}
