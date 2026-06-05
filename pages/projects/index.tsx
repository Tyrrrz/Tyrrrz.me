import { clsx } from "clsx";
import { FC } from "react";
import { FiArchive, FiCode, FiDownload, FiExternalLink, FiStar } from "react-icons/fi";
import { projects as rawProjects } from "virtual:projects";
import Heading from "../../components/heading";
import Inline from "../../components/inline";
import Link from "../../components/link";
import Meta from "../../components/meta";
import Paragraph from "../../components/paragraph";

const ProjectsPage: FC = () => {
  const projects = [...rawProjects].sort((a, b) => {
    if (a.archived && !b.archived) return 1;
    if (!a.archived && b.archived) return -1;

    return b.stars - a.stars;
  });

  return (
    <>
      <Meta title="Projects" />

      <section>
        <Heading>Projects</Heading>

        <Paragraph>
          These are the open-source projects that I&apos;ve built. Most of these started out of
          personal necessity, but over time evolved into popular tools used by thousands of people
          around the world. If you want to support the development of my projects, please consider{" "}
          <Link href="/donate">donating</Link>.
        </Paragraph>
      </section>

      <section className="mt-8 grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => (
          <section
            key={i}
            className={clsx("flex flex-col rounded border p-4 hover:opacity-100", {
              "opacity-50": project.archived,
              "border-purple-500": project.stars >= 1000,
              "border-purple-300": project.stars >= 100 && project.stars < 1000,
              "dark:border-purple-700": project.stars >= 100 && project.stars < 1000,
              "border-purple-100": project.stars < 100,
              "dark:border-purple-900": project.stars < 100,
            })}
          >
            {/* Name */}
            <div className="overflow-hidden text-lg text-ellipsis" title={project.name}>
              <Link href={project.url}>{project.name}</Link>
            </div>

            <div className="my-1 grow space-y-1">
              {/* Maintenance status */}
              {project.archived && (
                <div className="font-light">
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
                <div className="overflow-hidden">
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
            <div className="mt-1 flex flex-wrap gap-x-3 font-light">
              <Inline>
                <FiStar className="fill-yellow-400 dark:text-yellow-400" strokeWidth={1} />
                <div>{project.stars.toLocaleString("en-US")}</div>
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
                  <div>{project.downloads.toLocaleString("en-US")}</div>
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
