import fetch from 'node-fetch';

export const getNuGetDownloads = async (packageId: string) => {
  const url = `https://azuresearch-usnc.nuget.org/query?q=packageid:${packageId.toLowerCase()}`;
  const response = await fetch(url);

  // If the package doesn't exist, return 0 instead of failing
  if (response.status === 404) {
    return 0;
  }

  if (response.status !== 200) {
    throw new Error(
      `Failed to fetch NuGet package data. Status code: ${response.status}. Request URL: '${url}'.`
    );
  }

  // https://docs.microsoft.com/en-us/nuget/api/search-query-service-resource#response
  type ResponsePayload = {
    data: {
      totalDownloads: number;
    }[];
  };

  const payload = (await response.json()) as ResponsePayload;

  return payload.data.reduce((acc, cur) => acc + cur.totalDownloads, 0);
};
