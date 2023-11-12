import c from 'classnames';
import { GetStaticProps, NextPage } from 'next';
import { FiArchive, FiCode, FiDownload, FiExternalLink, FiStar } from 'react-icons/fi';
import Heading from '~/components/heading';
import Inline from '~/components/inline';
import Link from '~/components/link';
import Meta from '~/components/meta';
import Paragraph from '~/components/paragraph';
import { Project, loadProjects } from '~/data/projects';
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
          These are the open-source projects that I&apos;ve built. Most of these started out of
          personal necessity, but over time evolved into popular tools used by thousands of people
          around the world. If you want to support the development of my projects, please consider{' '}
          <Link href="/donate">donating</Link>.
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
                'border-purple-500': project.stars >= 1000,
                'border-purple-300': project.stars >= 100 && project.stars < 1000,
                'dark:border-purple-700': project.stars >= 100 && project.stars < 1000,
                'border-purple-100': project.stars < 100,
                'dark:border-purple-900': project.stars < 100
              },
              'rounded'
            )}
          >
            {/* Name */}
            <div className={c('text-lg', 'text-ellipsis', 'overflow-hidden')} title={project.name}>
              <Link href={project.url}>{project.name}</Link>
            </div>

            {/* Maintenance status */}
            <div className={c('grow', 'my-1', 'space-y-1')}>
              {project.archived && (
                <div className={c('font-light')}>
                  <Inline>
                    <FiArchive strokeWidth={1} />
                    <div>Not maintained</div>
                  </Inline>
                </div>
              )}

              {/* Description */}
              <div>{project.description}</div>

              {/* Homepage */}
              {project.homepageUrl && (
                <div className={c('overflow-hidden')}>
                  <Inline>
                    <FiExternalLink strokeWidth={1} />
                    <div>
                      <Link href={project.homepageUrl}>{project.homepageUrl}</Link>
                    </div>
                  </Inline>
                </div>
              )}
            </div>

            {/* Misc info */}
            <div className={c('flex', 'flex-wrap', 'mt-1', 'gap-x-3', 'font-light')}>
              <Inline>
                <FiStar className={c('fill-yellow-400')} strokeWidth={1} />
                <div>{project.stars.toLocaleString('en-US')}</div>
              </Inline>

              {project.language && (
                <Inline>
                  <FiCode strokeWidth={1} />
                  <div>{project.language}</div>
                </Inline>
              )}

              {project.downloads > 0 && (
                <Inline>
                  <FiDownload strokeWidth={1} />
                  <div>{project.downloads.toLocaleString('en-US')}</div>
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
  deleteUndefined(projects);

  projects.sort((a, b) => b.stars - a.stars);

  return {
    props: {
      projects
    }
  };
};

export default ProjectsPage;
