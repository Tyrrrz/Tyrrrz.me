import c from 'classnames';
import { GetStaticProps, NextPage } from 'next';
import { useMemo } from 'react';
import { FiCode, FiDownload, FiExternalLink, FiStar } from 'react-icons/fi';
import Heading from '../../components/heading';
import Inline from '../../components/inline';
import Link from '../../components/link';
import Meta from '../../components/meta';
import Page from '../../components/page';
import { loadProjects, Project } from '../../data';

type ProjectsPageProps = {
  projects: Project[];
};

const ProjectsPage: NextPage<ProjectsPageProps> = ({ projects }) => {
  const largeProjectStarsThreshold = useMemo(() => {
    return projects[Math.floor(projects.length * 0.3)].stars;
  }, [projects]);

  const mediumProjectStarsThreshold = useMemo(() => {
    return projects[Math.floor(projects.length * 0.7)].stars;
  }, [projects]);

  return (
    <Page>
      <Meta title="Projects" />
      <Heading>Projects</Heading>

      <div
        className={c(
          'grid',
          'sm:grid-cols-1',
          'md:grid-cols-2',
          'lg:grid-cols-3',
          'xl:grid-cols-4',
          '2xl:grid-cols-5',
          'gap-3'
        )}
      >
        {projects.map((project, i) => (
          <section
            key={i}
            className={c(
              'flex',
              'flex-col',
              'p-4',
              'border',
              {
                'border-purple-500': project.stars >= largeProjectStarsThreshold,
                'border-purple-300':
                  project.stars < largeProjectStarsThreshold &&
                  project.stars >= mediumProjectStarsThreshold
              },
              'rounded'
            )}
          >
            <div className={c('text-lg')}>
              <Link href={project.url}>{project.name}</Link>
            </div>

            <div className={c('grow', 'my-1')}>{project.description}</div>

            <div className={c('flex', 'flex-wrap', 'mt-1', 'gap-x-3', 'font-light')}>
              <Inline>
                <FiStar className={c('fill-yellow-400')} strokeWidth={1} />
                <span>{project.stars.toLocaleString('en-US')}</span>
              </Inline>

              {project.language && (
                <Inline>
                  <FiCode strokeWidth={1} />
                  <span>{project.language}</span>
                </Inline>
              )}

              {project.downloads > 0 && (
                <Inline>
                  <FiDownload strokeWidth={1} />
                  <span>{project.downloads.toLocaleString('en-US')}</span>
                </Inline>
              )}

              {project.homepageUrl && (
                <Inline>
                  <FiExternalLink strokeWidth={1} />
                  <span>
                    <Link href={project.homepageUrl}>Open</Link>
                  </span>
                </Inline>
              )}
            </div>
          </section>
        ))}
      </div>
    </Page>
  );
};

export const getStaticProps: GetStaticProps<ProjectsPageProps> = async () => {
  const projects: Project[] = [];
  for await (const project of loadProjects()) {
    projects.push(project);
  }

  projects.sort((a, b) => b.stars - a.stars);

  return {
    props: {
      projects
    }
  };
};

export default ProjectsPage;
