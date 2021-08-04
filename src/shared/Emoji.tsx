import React from 'react';
import twemoji from 'twemoji';
import './Emoji.css';

interface EmojiProps {
  code: string;
}

export default function Emoji({ code }: EmojiProps) {
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
}
