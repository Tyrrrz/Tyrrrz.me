const OWNER = 'tyrrrz';

export const getDockerDownloads = async (repositoryName: string) => {
  const url = `https://hub.docker.com/v2/repositories/${OWNER}/${repositoryName.toLowerCase()}`;
  const response = await fetch(url);

  // If the image doesn't exist, return 0 instead of failing
  if (response.status === 404) {
    return 0;
  }

  if (!response.ok) {
    throw new Error(
      `Request 'GET ${url}' failed. Status: ${response.status}. Body: '${await response.text()}'.`
    );
  }

  // https://docs.docker.com/docker-hub/api/latest/
  type ResponseBody = {
    pull_count: number;
  };

  const body: ResponseBody = await response.json();

  return body.pull_count || 0;
};
