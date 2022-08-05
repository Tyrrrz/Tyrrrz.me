import { getGitHubToken, isProduction } from '@/utils/env';
import { Octokit } from '@octokit/rest';
import 'isomorphic-fetch';

const github = new Octokit({
  auth: getGitHubToken()
});

export type Project = {
  name: string;
  url: string;
  description?: string;
  homepageUrl?: string;
  stars: number;
  downloads: number;
  language?: string;
};

const getFakeProjects = () => {
  const projects: Project[] = [
    {
      name: 'DiscordChatExporter',
      url: 'https://github.com/Tyrrrz/DiscordChatExporter',
      description: 'Exports Discord chat logs to a file',
      stars: 4123,
      downloads: 512345,
      language: 'C#'
    },
    {
      name: 'YoutubeDownloader',
      url: 'https://github.com/Tyrrrz/YoutubeDownloader',
      description: 'Downloads videos and playlists from YouTube',
      stars: 2123,
      downloads: 312345,
      language: 'C#'
    },
    {
      name: 'CliWrap',
      url: 'https://github.com/Tyrrrz/CliWrap',
      description: 'Library for running command line processes',
      stars: 2000,
      downloads: 2200123,
      language: 'C#'
    },
    {
      name: 'LightBulb',
      url: 'https://github.com/Tyrrrz/LightBulb',
      description: 'Reduces eye strain by adjusting gamma based on the current time',
      stars: 1512,
      downloads: 312345,
      language: 'C#'
    },
    {
      name: 'CliFx',
      url: 'https://github.com/Tyrrrz/CliFx',
      description: 'Declarative framework for building command line interfaces',
      stars: 1213,
      downloads: 211315,
      language: 'C#'
    },
    {
      name: 'YoutubeExplode',
      url: 'https://github.com/Tyrrrz/YoutubeExplode',
      description: 'The ultimate dirty YouTube library',
      stars: 1929,
      downloads: 912345,
      language: 'C#'
    },
    {
      name: 'Onova',
      url: 'https://github.com/Tyrrrz/Onova',
      description: 'Unopinionated auto-update framework for desktop applications',
      stars: 342,
      downloads: 41976,
      language: 'C#'
    },
    {
      name: 'SpellingUkraine',
      url: 'https://github.com/Tyrrrz/SpellingUkraine',
      description: 'Learn the correct way to spell Ukrainian names in English',
      homepageUrl: 'https://spellingukraine.com',
      stars: 35,
      downloads: 0,
      language: 'TypeScript'
    },
    {
      name: 'interview-questions',
      url: 'https://github.com/Tyrrrz/interview-questions',
      description: 'Collection of popular interview questions and their answers',
      stars: 41,
      downloads: 0
    }
  ];

  return projects;
};

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

export const loadProjects = async function* () {
  // Use fake data in development
  if (!isProduction()) {
    for (const project of getFakeProjects()) {
      yield project;
    }
  } else {
    for (const repo of await getGitHubRepos()) {
      if (!repo.stargazers_count || repo.stargazers_count < 35) {
        continue;
      }

      const downloads = [
        await getGitHubDownloads(repo.name),
        await getNuGetDownloads(repo.name)
      ].reduce((acc, cur) => acc + cur, 0);

      const project: Project = {
        name: repo.name,
        url: repo.html_url,
        description: repo.description || undefined,
        homepageUrl: repo.homepage || undefined,
        stars: repo.stargazers_count || 0,
        downloads,
        language: repo.language || undefined
      };

      yield project;
    }
  }
};
