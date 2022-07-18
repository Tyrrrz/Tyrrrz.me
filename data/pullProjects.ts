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

const getGitHubDownloads = async (repo: string) => {
  const releases = await github.paginate(github.repos.listReleases, {
    owner: 'Tyrrrz',
    repo,
    per_page: 100
  });

  return releases
    .flatMap((release) => release.assets)
    .reduce((acc, cur) => acc + cur.download_count, 0);
};

const getNuGetDownloads = async (pkg: string) => {
  const response = await fetch(
    `https://azuresearch-usnc.nuget.org/query?q=packageid:${pkg.toLowerCase()}`
  );

  // Not all projects are on NuGet
  if (response.status !== 200) {
    return 0;
  }

  const meta: {
    data: {
      totalDownloads: number;
    }[];
  } = await response.json();

  return meta.data.reduce((acc, val) => acc + val.totalDownloads, 0);
};

const pullProjects = async () => {
  const dirPath = path.resolve(process.cwd(), 'data', 'projects');
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
          description: repo.description || null,
          homepageUrl: repo.homepage || null,
          stars: repo.stargazers_count || 0,
          downloads,
          language: repo.language || null
        };

        await fs.writeFile(
          path.resolve(dirPath, `${project.name}.json`),
          JSON.stringify(project, null, 2) + '\n'
        );

        console.log(`Pulled ${project.name}.`);
      })
  );
};

export default pullProjects;
