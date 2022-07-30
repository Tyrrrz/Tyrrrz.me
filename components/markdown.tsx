import Codeblock from '@/components/codeblock';
import Heading from '@/components/heading';
import Link from '@/components/link';
import List from '@/components/list';
import c from 'classnames';
import { FC } from 'react';
import ReactMarkdown from 'react-markdown';

type MarkdownProps = {
  source: string;
};

const Markdown: FC<MarkdownProps> = ({ source }) => {
  return (
    <ReactMarkdown
      className={c('space-y-4')}
      components={{
        h1: ({ children }) => {
          return <Heading variant="h1">{children}</Heading>;
        },
        h2: ({ children }) => {
          return <Heading variant="h2">{children}</Heading>;
        },
        h3: ({ children }) => {
          return <Heading variant="h3">{children}</Heading>;
        },
        a: ({ href, children }) => {
          return <Link href={href || '#'}>{children}</Link>;
        },
        ul: ({ children }) => {
          return <List variant="unordered">{children}</List>;
        },
        ol: ({ children }) => {
          return <List variant="ordered">{children}</List>;
        },
        code: ({ className, children }) => {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : undefined;

          return (
            <Codeblock variant="multiline" language={language}>
              {children}
            </Codeblock>
          );
        }
      }}
    >
      {source}
    </ReactMarkdown>
  );
};

export default Markdown;
