import 'isomorphic-fetch';

export const getNuGetDownloads = async (packageId: string) => {
  const response = await fetch(
    `https://azuresearch-usnc.nuget.org/query?q=packageid:${packageId.toLowerCase()}`
  );

  // Not all projects are on NuGet
  if (response.status !== 200) {
    return 0;
  }

  type ResponsePayload = {
    data: {
      totalDownloads: number;
    }[];
  };

  const payload: ResponsePayload = await response.json();

  return payload.data.reduce((acc, val) => acc + val.totalDownloads, 0);
};
