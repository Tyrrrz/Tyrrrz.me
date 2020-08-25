import React from 'react';
import { FiCode, FiStar } from 'react-icons/fi';
import { getProjects, Project } from '../../infra/content';
import Layout from '../../shared/layout';
import Link from '../../shared/link';

interface ProjectsProps {
  projects: Project[];
}

export function getStaticProps() {
  const projects = getProjects();

  const props = {
    projects
  } as ProjectsProps;

  return { props };
}

export default function Projects({ projects }: ProjectsProps) {
  return (
    <Layout meta={{ title: 'Projects' }}>
      <h1 className="title">Projects</h1>

      {projects
        .sort((a, b) => b.stars - a.stars)
        .map((project) => (
          <div key={project.name} className="my-3">
            <div className="is-size-4">
              <Link href={project.url}>{project.name}</Link>
            </div>

            <div>{project.description}</div>

            <div className="opacity-70">
              <span>
                <FiStar className="align-middle" />{' '}
                <span className="align-middle">{project.stars}</span>
              </span>
              <span className="ml-2">
                <FiCode className="align-middle" />{' '}
                <span className="align-middle">{project.language}</span>
              </span>
            </div>
          </div>
        ))}
    </Layout>
  );
}
