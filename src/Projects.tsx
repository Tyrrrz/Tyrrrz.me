import { graphql } from 'gatsby';
import React from 'react';
import { FiDownload, FiPackage, FiStar } from 'react-icons/fi';
import Emoji from './shared/Emoji';
import Link from './shared/Link';
import Page from './shared/Page';

export const query = graphql`
  query {
    allProjectsJson {
      nodes {
        name
        url
        description
        stars
        downloads
        language
      }
    }
  }
`;

interface ProjectsPageProps {
  data: { allProjectsJson: GatsbyTypes.ProjectsJsonConnection };
}

export default function ProjectsPage({ data }: ProjectsPageProps) {
  const projects = [...data.allProjectsJson.nodes]
    .map((node) => ({
      name: node.name!,
      url: node.url!,
      description: node.description!,
      stars: node.stars!,
      downloads: node.downloads!,
      language: node.language!
    }))
    .sort((a, b) => b.stars - a.stars);

  return (
    <Page title="Projects">
      <div className="section-header">Projects</div>

      <div className="section-prelude">
        If you want to support development of my projects, please consider{' '}
        <Link href="/donate">making a donation</Link> <Emoji code="💛" />
      </div>

      {projects.map((p) => (
        <div key={p.name} className="entry">
          <div className="entry-name">
            <Link href={p.url}>{p.name}</Link>
          </div>

          <div className="entry-description">{p.description}</div>

          <div className="entry-info">
            <div className="label">
              <FiStar strokeWidth={1} fill="#ecc94b" />
              <div>{p.stars.toLocaleString()}</div>
            </div>

            <div className="label">
              <FiDownload strokeWidth={1} />
              <div>{p.downloads.toLocaleString()}</div>
            </div>

            <div className="label">
              <FiPackage strokeWidth={1} />
              <div>{p.language}</div>
            </div>
          </div>
        </div>
      ))}
    </Page>
  );
}
