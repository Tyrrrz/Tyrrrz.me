import c from 'classnames';
import { FC } from 'react';
import { FiArchive, FiCode, FiDownload, FiExternalLink, FiStar } from 'react-icons/fi';
import Heading from '~/components/heading';
import Image from '~/components/image';
import Inline from '~/components/inline';
import Link from '~/components/link';
import Paragraph from '~/components/paragraph';
import { Project } from '~/data/projects';

type ProjectsPageProps = {
  projects: Project[];
};

const ProjectsPage: FC<ProjectsPageProps> = ({ projects }) => {
  return (
    <>
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
              {
                'opacity-50': project.archived
              },
              'hover:opacity-100',
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

            <div className={c('grow', 'my-1', 'space-y-1')}>
              {/* Maintenance status */}
              {project.archived && (
                <div className={c('font-light')}>
                  <Inline>
                    <FiArchive strokeWidth={1} />
                    <div>Archived</div>
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
                <FiStar className={c('dark:text-yellow-400', 'fill-yellow-400')} strokeWidth={1} />
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

export default ProjectsPage;
