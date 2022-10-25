import Image from '@/components/image';
import c from 'classnames';
import { FC, useMemo } from 'react';

const getTwemojiId = (code: string) => {
  // Sourced from: https://github.com/twitter/twemoji/blob/21c0f5cc0c23bec2d433632cee9e3ebf4ed183e2/scripts/build.js#L571-L589

  const parts: string[] = [];

  let i = 0;
  let prev = 0;

  while (i < code.length) {
    const char = code.charCodeAt(i++);

    if (prev) {
      parts.push((0x10000 + ((prev - 0xd800) << 10) + (char - 0xdc00)).toString(16));
      prev = 0;
    } else if (0xd800 <= char && char <= 0xdbff) {
      prev = char;
    } else {
      parts.push(char.toString(16));
    }
  }

  return parts.join('-');
};

const getTwemojiUrl = (code: string) => {
  return `https://twemoji.maxcdn.com/v/latest/svg/${getTwemojiId(code)}.svg`;
};

type EmojiProps = {
  code: string;
};

const Emoji: FC<EmojiProps> = ({ code }) => {
  const url = useMemo(() => getTwemojiUrl(code), [code]);

  return (
    <span className={c('inline-block', 'w-[1em]', 'h-[1em]', 'mr-1')}>
      <Image src={url} alt={code} />
    </span>
  );
};

export default Emoji;
