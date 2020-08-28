export function getAbsoluteUrl(base: string, relative: string) {
  return new URL(relative, base).toString();
}

export function isAbsoluteUrl(url: string) {
  return /^[a-z][a-z\d+\-.]*:/iu.test(url);
}

export function trimEnd(str: string, end: string) {
  let temp = str;

  while (temp.endsWith(end)) {
    temp = temp.substr(0, temp.length - end.length);
  }

  return temp;
}

export function humanizeTimeToRead(timeToReadMins: number) {
  const timeToReadRoundMins = Math.round(timeToReadMins);
  const unit = timeToReadRoundMins === 1 ? 'minute' : 'minutes';
  return `${timeToReadRoundMins} ${unit} to read`;
}
