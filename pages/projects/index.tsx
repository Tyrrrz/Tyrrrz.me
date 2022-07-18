import { GetStaticProps, NextPage } from 'next';
import { getProjects, Project } from '../../data';

type ProjectsPageProps = {
  projects: Project[];
};

const ProjectsPage: NextPage<ProjectsPageProps> = ({ projects }) => {
  return <></>;
};

export const getStaticProps: GetStaticProps<ProjectsPageProps> = async () => {
  const projects: Project[] = [];
  for await (const project of getProjects()) {
    projects.push(project);
  }

  return {
    props: {
      projects
    }
  };
};

export default ProjectsPage;
