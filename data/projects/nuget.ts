import axios from 'axios';

export const getNuGetDownloads = async (packageId: string) => {
  // https://docs.microsoft.com/en-us/nuget/api/search-query-service-resource#response
  type ResponsePayload = {
    data: {
      totalDownloads: number;
    }[];
  };

  const response = await axios.get<ResponsePayload>(
    `https://azuresearch-usnc.nuget.org/query?q=packageid:${packageId.toLowerCase()}`,
    {
      validateStatus: (status) => status < 400 || status === 404
    }
  );

  // If the package doesn't exist, return 0 instead of failing
  if (response.status === 404) {
    return 0;
  }

  return response.data.data.reduce((acc, cur) => acc + cur.totalDownloads, 0);
};
