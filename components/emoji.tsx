import { FC, useMemo } from 'react';
import Box from './box';
import Image from './image';

type EmojiProps = {
  code: string;
};

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

const Emoji: FC<EmojiProps> = ({ code }) => {
  const url = useMemo(() => getTwemojiUrl(code), [code]);

  return (
    <Box
      type="span"
      style={{
        display: 'inline-block',
        width: '1em',
        height: '1em',
        margin: '0 0.05em 0 0.1em',
        verticalAlign: '-0.1em'
      }}
    >
      <Image src={url} alt={code} />
    </Box>
  );
};

export default Emoji;
