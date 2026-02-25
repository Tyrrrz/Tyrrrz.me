export const getNpmDownloads = async (packageName: string) => {
  const start = '2000-01-01';
  const end = new Date().toISOString().split('T')[0];
  const url = `https://api.npmjs.org/downloads/point/${start}:${end}/${packageName.toLowerCase()}`;
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

  // https://api.npmjs.org/
  type ResponseBody = {
    downloads: number;
  };

  const body: ResponseBody = await response.json();

  return body.downloads || 0;
};
