export function getAbsoluteUrl(base: string, relative: string){
  return new URL(relative, base).toString();
};

export function isAbsoluteUrl(url: string) {
  return /^[a-z][a-z\d+\-.]*:/iu.test(url);
}

export function humanizeTimeToRead(timeToReadMins: number) {
  const unit = timeToReadMins === 1 ? 'minute' : 'minutes';
  return `${timeToReadMins} ${unit} to read`;
}
