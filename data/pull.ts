import pullProjects from './pullProjects';

const main = async () => {
  await pullProjects();
};

main().catch((err) => console.error('Error', err));
