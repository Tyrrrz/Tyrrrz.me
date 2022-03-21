export const trimEnd = (str: string, end: string) => {
  let temp = str;

  while (temp.endsWith(end)) {
    temp = temp.substr(0, temp.length - end.length);
  }

  return temp;
};
