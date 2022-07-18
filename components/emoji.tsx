import { FC } from 'react';
import { parse as emojiToHtml } from 'twemoji';
import Box from './box';

type EmojiProps = {
  code: string;
};

const Emoji: FC<EmojiProps> = ({ code }) => {
  return (
    <Box
      type="span"
      classes={[]}
      innerHtml={emojiToHtml(code, {
        folder: 'svg',
        ext: '.svg'
      })}
    />
  );
};

export default Emoji;
