// @ts-check

const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const path = require('path');

const outputDirPath = path.resolve('./data/projects/');

async function run() {
  const github = new Octokit();

  const { data: repos } = await github.repos.listForUser({
    username: 'Tyrrrz',
    type: 'owner',
    per_page: 100,
    sort: 'pushed'
  });

  const projects = repos
    .map((repo) => ({
      name: repo.name,
      url: repo.html_url,
      description: repo.description,
      stars: repo.stargazers_count,
      language: repo.language
    }))
    .filter((project) => project.stars >= 35);

  projects.forEach((project) => {
    const json = JSON.stringify(project, null, 2) + '\n';
    const filePath = path.resolve(outputDirPath, `${project.name}.json`);

    fs.writeFileSync(filePath, json);
    console.log(`Pulled ${project.name}.`);
  });
}

run();
