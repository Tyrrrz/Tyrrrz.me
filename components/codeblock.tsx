import c from 'classnames';
import { FC, PropsWithChildren } from 'react';
import { Prism } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';

type CodeblockProps = PropsWithChildren<{
  variant?: 'inline' | 'multiline';
  language?: string;
}>;

const Codeblock: FC<CodeblockProps> = ({ variant = 'inline', language, children }) => {
  if (variant === 'multiline' && language) {
    return (
      <Prism
        style={tomorrow}
        customStyle={{ fontSize: '0.9rem', borderRadius: '0.25rem' }}
        language={language}
      >
        {String(children)}
      </Prism>
    );
  }

  return <code className={c('px-1', 'font-mono', 'bg-neutral-100')}>{children}</code>;
};

export default Codeblock;
