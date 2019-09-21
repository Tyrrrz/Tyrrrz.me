const fs = require('fs');
const path = require('path');
const axios = require('axios');

const outputDirPath = path.resolve(__dirname, `..`, `src`, `data`, `projects`);

const run = async () => {
  // Fetch GitHub API to get my repos
  const result = await axios.get(
    `https://api.github.com/users/Tyrrrz/repos?visibility=public`
  );

  // Extract data, filter and sort
  const projects = result.data
    .map(repo => ({
      name: repo.name,
      url: repo.html_url,
      description: repo.description,
      stars: repo.stargazers_count,
      language: repo.language
    }))
    .filter(repo => repo.stars >= 35);

  // Store in files
  projects.forEach(project => {
    const json = JSON.stringify(project, null, 2) + '\n';
    const filePath = path.resolve(outputDirPath, `${project.name}.json`);
    fs.writeFileSync(filePath, json);
  });

  console.log(`Pulled ${projects.length} projects.`);
};

run();
