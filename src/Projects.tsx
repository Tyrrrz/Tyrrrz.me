import { graphql } from 'gatsby';
import React from 'react';
import { FiCode, FiStar } from 'react-icons/fi';
import Layout from './shared/Layout';
import Link from './shared/Link';

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
    <Layout meta={{ title: 'Projects' }}>
      <h1 className="title">Projects</h1>

      <div className="fs-2 mb-5">
        If you want to support development of my projects, you are welcome to{' '}
        <Link href="/donate">make a donation</Link> 💛
      </div>

      {projects.map((project) => (
        <div key={project.name} className="my-4">
          <div className="fs-2">
            <Link href={project.url}>{project.name}</Link>
          </div>

          <div className="mt-1">{project.description}</div>

          <div className="opacity-70 mt-1">
            <span>
              <FiStar className="align-middle" />{' '}
              <span className={`align-middle ${project.stars >= 500 && 'fw-semi-bold'}`}>
                {project.stars}
              </span>
            </span>

            <span className="ml-3">
              <FiCode className="align-middle" />{' '}
              <span className="align-middle">{project.language}</span>
            </span>
          </div>
        </div>
      ))}
    </Layout>
  );
}
