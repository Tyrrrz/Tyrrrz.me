import { Octokit } from '@octokit/rest';
import { OctokitResponse } from '@octokit/types/dist-types';
import { ReposGetResponseData } from '@octokit/types/dist-types/generated/Endpoints';
import fs from 'fs';
import path from 'path';

const outputDirPath = path.resolve('./projects/');

const run = async () => {
  const github = new Octokit();

  const { data: repos } = (await github.repos.listForUser({
    username: 'Tyrrrz',
    type: 'owner',
    per_page: 100,
    sort: 'pushed'
  })) as OctokitResponse<ReposGetResponseData[]>;

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
    fs.writeFile(filePath, json, () => console.log(`Pulled ${project.name}`));
  });
};

run();
