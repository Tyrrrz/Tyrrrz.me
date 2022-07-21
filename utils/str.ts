type GetTimeToReadOptions = {
  wordsPerMinute?: number;
};

export const getTimeToReadMs = (text: string, options?: GetTimeToReadOptions) => {
  const { wordsPerMinute = 350 } = options || {};
  const words = text.split(/\s/g).length;
  return (words * 60000) / wordsPerMinute;
};
