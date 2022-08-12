import 'isomorphic-fetch';

export const getNuGetDownloads = async (pkg: string) => {
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
