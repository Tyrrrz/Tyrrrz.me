import c from 'classnames';
import { GetStaticProps, NextPage } from 'next';
import { FiArchive, FiCode, FiDownload, FiExternalLink, FiStar } from 'react-icons/fi';
import Heading from '~/components/heading';
import Inline from '~/components/inline';
import Link from '~/components/link';
import Meta from '~/components/meta';
import Paragraph from '~/components/paragraph';
import { loadProjects, Project } from '~/data/projects';
import { bufferIterable } from '~/utils/async';
import { deleteUndefined } from '~/utils/object';

type ProjectsPageProps = {
  projects: Project[];
};

const ProjectsPage: NextPage<ProjectsPageProps> = ({ projects }) => {
  return (
    <>
      <Meta title="Projects" />

      <section>
        <Heading>Projects</Heading>

        <Paragraph>
          These are the open source projects that I&apos;ve built. Most of these started out of
          personal necessity, but over time evolved into popular tools used by thousands of people
          around the world. If you want to support the development of my projects, please consider{' '}
          <Link href="/donate">donating.</Link>
        </Paragraph>
      </section>

      <section
        className={c('grid', 'sm:grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'mt-8', 'gap-3')}
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
                'border-purple-500': i <= 5,
                'border-purple-300': i > 5 && i <= 11
              },
              'rounded'
            )}
          >
            <div className={c('text-lg', 'break-all')}>
              <Link href={project.url}>{project.name}</Link>
            </div>

            <div className={c('grow', 'my-1', 'space-y-1')}>
              {project.archived && (
                <div className={c('font-light')}>
                  <Inline>
                    <FiArchive strokeWidth={1} />
                    <span>Not maintained</span>
                  </Inline>
                </div>
              )}

              <div>{project.description}</div>

              {project.homepageUrl && (
                <div className={c('overflow-hidden')}>
                  <Inline>
                    <FiExternalLink strokeWidth={1} />
                    <span>
                      <Link href={project.homepageUrl}>{project.homepageUrl}</Link>
                    </span>
                  </Inline>
                </div>
              )}
            </div>

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
            </div>
          </section>
        ))}
      </section>
    </>
  );
};

export const getStaticProps: GetStaticProps<ProjectsPageProps> = async () => {
  const projects = await bufferIterable(loadProjects());

  // Remove undefined values because they cannot be serialized
  for (const project of projects) {
    deleteUndefined(project);
  }

  projects.sort((a, b) => b.stars - a.stars);

  return {
    props: {
      projects
    }
  };
};

export default ProjectsPage;
