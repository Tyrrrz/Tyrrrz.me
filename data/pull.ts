import pullProjects from './pullProjects';

const main = async () => {
  await pullProjects();
};

main().catch(console.error);
