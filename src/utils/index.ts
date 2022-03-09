export const getAbsoluteUrl = (base: string, relative: string) => {
  return new URL(relative, base).toString();
};

export const isAbsoluteUrl = (url: string) => {
  return /^[a-z][a-z\d+\-.]*:/iu.test(url);
};

export const trimEnd = (str: string, end: string) => {
  let temp = str;

  while (temp.endsWith(end)) {
    temp = temp.substr(0, temp.length - end.length);
  }

  return temp;
};
