import { Octokit } from '@octokit/rest';
import fs from 'fs/promises';
import path from 'path';

const github = new Octokit();

const getGitHubRepos = async () => {
  return await github.paginate(github.repos.listForUser, {
    username: 'Tyrrrz',
    type: 'owner',
    per_page: 100,
    sort: 'pushed'
  });
};

const getGitHubDownloads = async (repositoryName: string) => {
  const releases = await github.paginate(github.repos.listReleases, {
    owner: 'Tyrrrz',
    repo: repositoryName,
    per_page: 100
  });

  return releases
    .map((release) => release.assets)
    .reduce((acc, val) => acc.concat(val), [])
    .map((asset) => asset.download_count)
    .reduce((acc, val) => acc + val, 0);
};

const getNuGetDownloads = async (packageName: string) => {
  const response = await fetch(
    `https://azuresearch-usnc.nuget.org/query?q=packageid:${packageName.toLowerCase()}`
  );

  // Not all projects are on NuGet
  if (response.status !== 200) {
    return 0;
  }

  const meta = (await response.json()) as { data: { totalDownloads: number }[] };

  return meta.data.reduce((acc, val) => acc + val.totalDownloads, 0);
};

const pullProjects = async () => {
  const dirPath = path.resolve('./data/projects/');
  const repos = await getGitHubRepos();

  await Promise.allSettled(
    repos
      .filter((repo) => repo.stargazers_count && repo.stargazers_count >= 35)
      .map(async (repo) => {
        const downloads = [
          await getGitHubDownloads(repo.name),
          await getNuGetDownloads(repo.name)
        ].reduce((acc, cur) => acc + cur, 0);

        const project = {
          name: repo.name,
          url: repo.html_url,
          description: repo.description,
          stars: repo.stargazers_count,
          downloads,
          language: repo.language
        };

        const json = JSON.stringify(project, null, 2) + '\n';
        const filePath = path.resolve(dirPath, `${project.name}.json`);

        await fs.writeFile(filePath, json);
        console.log(`Pulled ${project.name}.`);
      })
  );
};

export default pullProjects;
