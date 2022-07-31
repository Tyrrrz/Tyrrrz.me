import Code from '@/components/code';
import Heading from '@/components/heading';
import Link from '@/components/link';
import List from '@/components/list';
import Paragraph from '@/components/paragraph';
import Pre from '@/components/pre';
import Quote from '@/components/quote';
import c from 'classnames';
import { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import Syntax from './syntax';

type MarkdownProps = {
  source: string;
};

const Markdown: FC<MarkdownProps> = ({ source }) => {
  return (
    <ReactMarkdown
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
        p: ({ children }) => {
          return <Paragraph>{children}</Paragraph>;
        },
        strong: ({ children }) => {
          return <span className={c('font-semibold')}>{children}</span>;
        },
        ul: ({ children }) => {
          return <List variant="unordered">{children}</List>;
        },
        ol: ({ start, children }) => {
          return (
            <List variant="ordered" start={start}>
              {children}
            </List>
          );
        },
        blockquote: ({ children }) => {
          return <Quote>{children}</Quote>;
        },
        pre: ({ node, children }) => {
          // Language is set on the child <code> element
          if (
            node.children.length === 1 &&
            node.children[0].type === 'element' &&
            node.children[0].tagName === 'code' &&
            node.children[0].children.length === 1 &&
            node.children[0].children[0].type === 'text'
          ) {
            const source = node.children[0].children[0].value;

            const className =
              typeof node.children[0].properties?.className === 'object'
                ? node.children[0].properties.className?.join(' ')
                : String(node.children[0].properties?.className);

            const language = className && /language-(\w+)/iu.exec(className)?.[1];

            if (language) {
              return <Syntax source={source} language={language} />;
            }
          }

          return <Pre>{children}</Pre>;
        },
        code: ({ children }) => {
          return <Code>{children}</Code>;
        },
        hr: () => {
          return <hr className={c('w-3/4', 'mx-auto', 'my-4', 'border', 'rounded')} />;
        }
      }}
    >
      {source}
    </ReactMarkdown>
  );
};

export default Markdown;
