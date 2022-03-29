import { graphql } from 'gatsby';
import React from 'react';
import { FiDownload, FiPackage, FiStar } from 'react-icons/fi';
import Emoji from './components/Emoji';
import Link from './components/Link';
import Page from './components/Page';

interface ProjectsPageProps {
  data: {
    projects: GatsbyTypes.ProjectsJsonConnection;
  };
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({ data }) => {
  const projects = data.projects.nodes
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

      {projects.map((project) => (
        <div key={project.name} className="entry">
          <div className="entry-name">
            <Link href={project.url}>{project.name}</Link>
          </div>

          <div className="entry-description">{project.description}</div>

          <div className="entry-info">
            <div className="label">
              <FiStar strokeWidth={1} fill="#ecc94b" />
              <div>{project.stars.toLocaleString()}</div>
            </div>

            <div className="label">
              <FiDownload strokeWidth={1} />
              <div>{project.downloads > 0 ? project.downloads.toLocaleString() : 'N/A'}</div>
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
};

export const query = graphql`
  query {
    projects: allProjectsJson {
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

export default ProjectsPage;
