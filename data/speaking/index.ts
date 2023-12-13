export type SpeakingEngagement = {
  title: string;
  kind: 'talk' | 'workshop' | 'podcast';
  event: string;
  date: string;
  language: 'ukrainian' | 'russian' | 'english';
  eventUrl?: string;
  presentationUrl?: string;
  recordingUrl?: string;
};

const engagements: SpeakingEngagement[] = [
  {
    title: 'Writing Parsers in C#',
    kind: 'talk',
    event: '3Shape Meetup',
    date: '2019-05-24',
    language: 'english',
    eventUrl: 'https://facebook.com/Lifeat3shape',
    presentationUrl:
      'https://slideshare.net/AlexeyGolub/alexey-golub-writing-parsers-in-c-3shape-meetup'
  },
  {
    title: 'Monadic Parser Combinators in C#',
    kind: 'talk',
    event: '.NET Fest',
    date: '2019-10-25',
    language: 'russian',
    eventUrl: 'http://dotnetfest.com/dotnetfest2019/indexe.html',
    presentationUrl: 'https://github.com/Tyrrrz/DotNetFest2019',
    recordingUrl: 'https://youtube.com/watch?v=Ee3w2Q6Qqnk'
  },
  {
    title: 'Dependency Absolution',
    kind: 'talk',
    event: 'Svitla Smart Talk',
    date: '2019-12-12',
    language: 'russian',
    eventUrl: 'https://facebook.com/events/2561040607325388',
    presentationUrl:
      'https://slideshare.net/AlexeyGolub/alexey-golub-dependency-absolution-application-as-a-pipeline-svitla-smart-talks'
  },
  {
    title: 'GitHub Actions in Action',
    kind: 'talk',
    event: 'MSP Meetup',
    date: '2020-02-15',
    language: 'russian',
    eventUrl: 'https://facebook.com/events/623781598371536'
  },
  {
    title: 'Expression Trees in C#',
    kind: 'talk',
    event: 'DataArt IT talks',
    date: '2020-02-29',
    language: 'russian',
    eventUrl: 'https://facebook.com/events/117461183014600',
    presentationUrl: 'https://slideshare.net/AlexeyGolub/expression-trees-in-c'
  },
  {
    title: 'Expression Trees in C#',
    kind: 'talk',
    event: '.NET fwdays',
    date: '2020-04-11',
    language: 'russian',
    eventUrl: 'https://fwdays.com/en/event/dotnet-fwdays-2020/review/expression-trees-in-c-sharp',
    presentationUrl: 'https://slideshare.net/fwdays/expression-trees-in-c-fwdays-oleksii-holub',
    recordingUrl: 'https://youtube.com/watch?v=yUzWaJ2jjwE'
  },
  {
    title: 'Learning F# by Designing Your Own Language',
    kind: 'talk',
    event: 'JetBrains .NET Days',
    date: '2020-05-14',
    language: 'english',
    eventUrl: 'https://pages.jetbrains.com/dotnet-days-2020',
    presentationUrl: 'https://github.com/Tyrrrz/JetBrainsDotnetDay2020',
    recordingUrl: 'https://youtube.com/watch?v=34C_7halqGw'
  },
  {
    title: 'GitHub Actions in Action',
    kind: 'talk',
    event: 'DevOps Fest',
    date: '2020-06-04',
    language: 'english',
    eventUrl: 'https://devopsfest.com.ua/devopstfest2020/indexe.html',
    presentationUrl:
      'https://slideshare.net/DevOps_Fest/devops-fest-2020-alexey-golub-github-actions-in-action',
    recordingUrl: 'https://youtube.com/watch?v=ZKXE04Pkrhs'
  },
  {
    title: 'Integrating with External APIs',
    kind: 'podcast',
    event: '.NET Core Show',
    date: '2020-07-10',
    language: 'english',
    eventUrl: 'https://dotnetcore.show',
    recordingUrl: 'https://dotnetcore.show/episode-55-working-with-external-apis-with-alexey-golub'
  },
  {
    title: 'Fallacies of Unit Testing',
    kind: 'talk',
    event: '.NET Summit',
    date: '2020-08-07',
    language: 'english',
    eventUrl: 'https://dotnetsummit.by',
    presentationUrl: 'https://slideshare.net/AlexeyGolub/fallacies-of-unit-testing',
    recordingUrl: 'https://youtube.com/watch?v=1qj6l8Eyj68'
  },
  {
    title: 'Unit Testing Considered Harmful',
    kind: 'podcast',
    event: 'Airhacks.fm',
    date: '2020-08-30',
    language: 'english',
    eventUrl: 'https://airhacks.fm',
    recordingUrl: 'https://airhacks.fm/#episode_103'
  },
  {
    title: 'Expression Trees in C#',
    kind: 'talk',
    event: 'MS Stage',
    date: '2020-10-02',
    language: 'english',
    eventUrl: 'https://msstage.com/speakers/alexey-golub',
    presentationUrl: 'https://slideshare.net/AlexeyGolub/expression-trees-in-c-238893586',
    recordingUrl: 'https://youtube.com/watch?v=US_3kUD5j2w'
  },
  {
    title: 'Modern Full-Stack App via Hipster Cloud',
    kind: 'workshop',
    event: '.NET fwdays',
    date: '2021-08-10',
    language: 'ukrainian',
    eventUrl:
      'https://fwdays.com/en/event/dotnet-fwdays-2021/review/full-stack-app-via-hipster-cloud',
    recordingUrl: 'https://youtube.com/watch?v=hdDBKLHLrKU'
  },
  {
    title: 'Intro to CliWrap',
    kind: 'talk',
    event: 'JetBrains OSS Power-Ups',
    date: '2021-09-23',
    language: 'english',
    eventUrl: 'https://blog.jetbrains.com/dotnet/2021/09/08/oss-power-ups-cliwrap',
    presentationUrl: 'https://slideshare.net/AlexeyGolub/intro-to-cliwrap',
    recordingUrl: 'https://youtube.com/watch?v=3_Ucw3Fflmo'
  },
  {
    title: 'Intro to CliWrap',
    kind: 'talk',
    event: '.NET Conf (Ukraine)',
    date: '2021-11-19',
    language: 'ukrainian',
    eventUrl: 'https://facebook.com/events/1520226448376525?post_id=1529085947490575',
    presentationUrl: 'https://slideshare.net/AlexeyGolub/intro-to-cliwrap-250687433',
    recordingUrl: 'https://youtube.com/watch?v=B25RVkPrUFI'
  },
  {
    title: 'The Work-War Balance of Open Source Developers in Ukraine',
    kind: 'podcast',
    event: 'The New Stack',
    date: '2022-03-23',
    language: 'english',
    eventUrl: 'https://thenewstack.io/the-work-war-balance-of-open-source-developers-in-ukraine',
    recordingUrl: 'https://youtube.com/watch?v=8LAevD-FLJ4'
  },
  {
    title: 'Developing Your Personal Brand',
    kind: 'podcast',
    event: 'DOU Podcast',
    date: '2022-07-14',
    language: 'ukrainian',
    eventUrl: 'https://dou.ua/forums/topic/39124',
    recordingUrl: 'https://dou.ua/forums/topic/39124'
  },
  {
    title: 'Intro to CliWrap',
    kind: 'talk',
    event: 'Svitla Smart Talk',
    date: '2022-08-30',
    language: 'english',
    eventUrl:
      'https://kommunity.com/svitla-systems/events/svitla-smart-talk-interacting-with-command-line-in-net-using-cliwrap-3d39c180',
    presentationUrl: 'https://slideshare.net/AlexeyGolub/intro-to-cliwrap'
  },
  {
    title: 'Reality-Driven Testing Using TestContainers',
    kind: 'talk',
    event: '.NET Conf (Ukraine)',
    date: '2023-12-13',
    language: 'ukrainian',
    eventUrl: 'https://kommunity.com/svitla-systems/events/svitla-smart-talk-net-conf-db7d2cd9',
    presentationUrl:
      'https://slideshare.net/AlexeyGolub/realitydriven-testing-using-testcontainers',
    recordingUrl: 'https://youtube.com/watch?v=ORapxIWoEco'
  }
];

// This doesn't need to be an async iterator, but I wanted it to be consistent
// with other data sources.
export const loadSpeakingEngagements = async function* () {
  yield* engagements;
};
