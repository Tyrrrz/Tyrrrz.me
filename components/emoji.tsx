import { FC } from 'react';
import { parse as emojiToHtml } from 'twemoji';

type EmojiProps = {
  code: string;
};

const Emoji: FC<EmojiProps> = ({ code }) => {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: emojiToHtml(code, {
          folder: 'svg',
          ext: '.svg'
        })
      }}
    />
  );
};

export default Emoji;
