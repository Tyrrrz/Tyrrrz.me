import { Octokit } from '@octokit/rest';
import { writeFileSync } from 'fs';
import fetch from 'node-fetch';
import { resolve } from 'path';

const outputDirPath = resolve('./data/projects/');
const github = new Octokit();

const getGitHubRepos = async () => {
  return await github.paginate(github.repos.listForUser, {
    username: 'Tyrrrz',
    type: 'owner',
    per_page: 100,
    sort: 'pushed'
  });
};

const getGitHubDownloads = async (repo) => {
  const releases = await github.paginate(github.repos.listReleases, {
    owner: 'Tyrrrz',
    repo,
    per_page: 100
  });

  return releases
    .map((release) => release.assets)
    .reduce((acc, val) => acc.concat(val), [])
    .map((asset) => asset.download_count)
    .reduce((acc, val) => acc + val, 0);
};

const getNuGetDownloads = async (pkg) => {
  const response = await fetch(
    `https://azuresearch-usnc.nuget.org/query?q=packageid:${pkg.toLowerCase()}`
  );

  // Not all projects are on NuGet
  if (response.status !== 200) {
    return 0;
  }

  const meta = await response.json();

  return meta.data.reduce((acc, val) => acc + val.totalDownloads, 0);
};

const main = () => {
  const repos = await getGitHubRepos();

  await Promise.allSettled(
    repos
      .filter((repo) => repo.stargazers_count >= 35)
      .map(async (repo) => {
        const gitHubDownloads = await getGitHubDownloads(repo.name);
        const nuGetDownloads = await getNuGetDownloads(repo.name);

        const project = {
          name: repo.name,
          url: repo.html_url,
          description: repo.description,
          stars: repo.stargazers_count,
          downloads: gitHubDownloads + nuGetDownloads,
          language: repo.language
        };

        const json = JSON.stringify(project, null, 2) + '\n';
        const filePath = resolve(outputDirPath, `${project.name}.json`);

        writeFileSync(filePath, json);
        console.log(`Pulled ${project.name}.`);
      })
  );
};

main();
