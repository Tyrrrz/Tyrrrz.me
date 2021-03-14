import { graphql } from 'gatsby';
import React from 'react';
import { FiPackage, FiStar } from 'react-icons/fi';
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
      language: node.language!
    }))
    .sort((a, b) => b.stars - a.stars);

  return (
    <Page title="Projects">
      <div className="section-header">Projects</div>

      <div className="section-prelude">
        If you want to support development of my projects, please consider{' '}
        <Link href="/donate">making a donation</Link> 💛
      </div>

      {projects.map((project) => (
        <div key={project.name} className="entry">
          <div className="entry-name">
            <Link href={project.url}>{project.name}</Link>
          </div>

          <div className="entry-description">{project.description}</div>

          <div className="entry-info">
            <div className="label">
              <FiStar strokeWidth={1} fill="#ecc94b" />
              <div>{project.stars}</div>
            </div>

            <div className="label">
              <FiPackage strokeWidth={1} />
              <div>{project.language}</div>
            </div>
          </div>
        </div>
      ))}
    </Page>
  );
}
