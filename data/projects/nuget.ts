export const getNuGetDownloads = async (packageId: string) => {
  const url = `https://azuresearch-usnc.nuget.org/query?q=packageid:${packageId.toLowerCase()}`;
  const response = await fetch(url);

  // If the package doesn't exist, return 0 instead of failing
  if (response.status === 404) {
    return 0;
  }

  if (!response.ok) {
    throw new Error(
      `Request 'GET ${url}' failed. Status: ${response.status}. Body: '${await response.text()}'.`
    );
  }

  // https://docs.microsoft.com/en-us/nuget/api/search-query-service-resource#response
  type ResponseBody = {
    data: {
      totalDownloads: number;
    }[];
  };

  const body: ResponseBody = await response.json();

  return body.data.reduce((acc, cur) => acc + cur.totalDownloads, 0);
};
