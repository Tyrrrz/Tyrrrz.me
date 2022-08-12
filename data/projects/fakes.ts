import type { Project } from '@/data/projects';

const fakes: Project[] = [
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

export default fakes;
