import { GetStaticProps, NextPage } from 'next';
import { ProjectStats, loadProjectStats } from '~/data/projects';

const WIDTH = 440;
const HEIGHT = 165;
const PADDING = 20;
const STAT_SPACING = 50;
const COLUMN_WIDTH = (WIDTH - 2 * PADDING) / 2;

const ProjectsSvg: NextPage<ProjectStats> & { skipLayout: boolean } = ({
  totalRepos,
  totalStars,
  totalDownloads,
  totalIssuesAndPRs
}) => {
  return (
    <svg width={WIDTH} height={HEIGHT} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#9333ea', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#c084fc', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width={WIDTH} height={HEIGHT} fill="#1a1a1a" rx="10" />

      {/* Title */}
      <text
        x={WIDTH / 2}
        y={PADDING + 20}
        fontFamily="'Segoe UI', Arial, sans-serif"
        fontSize="24"
        fontWeight="bold"
        fill="url(#gradient)"
        textAnchor="middle"
      >
        GitHub Stats
      </text>

      {/* Stats Grid */}
      <g transform={`translate(${PADDING}, ${PADDING + 50})`}>
        {/* Repositories */}
        <g>
          <text x="0" y="0" fontFamily="'Segoe UI', Arial, sans-serif" fontSize="14" fill="#9ca3af">
            📦 Repositories
          </text>
          <text
            x="0"
            y="20"
            fontFamily="'Segoe UI', Arial, sans-serif"
            fontSize="20"
            fontWeight="bold"
            fill="#ffffff"
          >
            {totalRepos.toLocaleString()}
          </text>
        </g>

        {/* Total Stars */}
        <g transform={`translate(${COLUMN_WIDTH}, 0)`}>
          <text x="0" y="0" fontFamily="'Segoe UI', Arial, sans-serif" fontSize="14" fill="#9ca3af">
            ⭐ Total Stars
          </text>
          <text
            x="0"
            y="20"
            fontFamily="'Segoe UI', Arial, sans-serif"
            fontSize="20"
            fontWeight="bold"
            fill="#ffffff"
          >
            {totalStars.toLocaleString()}
          </text>
        </g>

        {/* Total Downloads */}
        <g transform={`translate(0, ${STAT_SPACING})`}>
          <text x="0" y="0" fontFamily="'Segoe UI', Arial, sans-serif" fontSize="14" fill="#9ca3af">
            📥 Total Downloads
          </text>
          <text
            x="0"
            y="20"
            fontFamily="'Segoe UI', Arial, sans-serif"
            fontSize="20"
            fontWeight="bold"
            fill="#ffffff"
          >
            {totalDownloads.toLocaleString()}
          </text>
        </g>

        {/* Issues & PRs */}
        <g transform={`translate(${COLUMN_WIDTH}, ${STAT_SPACING})`}>
          <text x="0" y="0" fontFamily="'Segoe UI', Arial, sans-serif" fontSize="14" fill="#9ca3af">
            🔖 Issues &amp; PRs
          </text>
          <text
            x="0"
            y="20"
            fontFamily="'Segoe UI', Arial, sans-serif"
            fontSize="20"
            fontWeight="bold"
            fill="#ffffff"
          >
            {totalIssuesAndPRs.toLocaleString()}
          </text>
        </g>
      </g>
    </svg>
  );
};

export const getStaticProps: GetStaticProps<ProjectStats> = async () => {
  const stats = await loadProjectStats();
  return { props: stats };
};

// Skip the site layout — serve raw SVG content only
ProjectsSvg.skipLayout = true;

export default ProjectsSvg;
