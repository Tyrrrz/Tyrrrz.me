import React from 'react';
import twemoji from 'twemoji';
import './Emoji.css';

interface EmojiProps {
  code: string;
}

const Emoji: React.FC<EmojiProps> = ({ code }) => {
  return (
    <span
      className="emoji"
      dangerouslySetInnerHTML={{
        __html: twemoji.parse(code, {
          folder: 'svg',
          ext: '.svg'
        })
      }}
    />
  );
};

export default Emoji;
