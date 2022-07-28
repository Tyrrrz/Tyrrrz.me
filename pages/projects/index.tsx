import { GetStaticProps, NextPage } from 'next';
import Heading from '../../components/heading';
import Meta from '../../components/meta';
import Page from '../../components/page';
import { loadProjects, Project } from '../../data';

type ProjectsPageProps = {
  projects: Project[];
};

const ProjectsPage: NextPage<ProjectsPageProps> = ({ projects }) => {
  return (
    <Page>
      <Meta title="Projects" />
      <Heading>Projects</Heading>
    </Page>
  );
};

export const getStaticProps: GetStaticProps<ProjectsPageProps> = async () => {
  const projects: Project[] = [];
  for await (const project of loadProjects()) {
    projects.push(project);
  }

  return {
    props: {
      projects
    }
  };
};

export default ProjectsPage;
