import React from 'react';
import { FiCode, FiStar } from 'react-icons/fi';
import { getProjects, Project } from '../../infra/content';
import Layout from '../../shared/layout';
import Link from '../../shared/link';

interface ProjectsPageProps {
  projects: Project[];
}

export function getStaticProps() {
  const projects = getProjects();

  const props = {
    projects
  } as ProjectsPageProps;

  return { props };
}

export default function ProjectsPage({ projects }: ProjectsPageProps) {
  return (
    <Layout meta={{ title: 'Projects' }}>
      <h1 className="title">Projects</h1>

      <p>
        List of all open source projects that I maintain.
        <br />
        If you want to support development of my projects, you are welcome to{' '}
        <Link href="/donate">make a donation</Link> 💛
      </p>

      {projects
        .sort((a, b) => b.stars - a.stars)
        .map((project) => (
          <div key={project.id} className="my-4">
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
