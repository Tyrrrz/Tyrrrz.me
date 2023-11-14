import c from 'classnames';
import { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import Code from '~/components/code';
import Heading from '~/components/heading';
import Image from '~/components/image';
import Link from '~/components/link';
import List from '~/components/list';
import Paragraph from '~/components/paragraph';
import Pre from '~/components/pre';
import Quote from '~/components/quote';
import Syntax from '~/components/syntax';
import { slugify } from '~/utils/url';

type MarkdownProps = {
  source: string;
  transformUrl?: (src: string) => string;
};

const Markdown: FC<MarkdownProps> = ({ source, transformUrl }) => {
  return (
    <ReactMarkdown
      urlTransform={transformUrl}
      components={{
        h1: ({ node, children }) => {
          const id =
            node?.children?.[0]?.type === 'text' ? slugify(node.children[0].value) : undefined;

          return (
            <Heading id={id} level={1}>
              {children}
            </Heading>
          );
        },
        h2: ({ node, children }) => {
          const id =
            node?.children?.[0]?.type === 'text' ? slugify(node.children[0].value) : undefined;

          return (
            <Heading id={id} level={2}>
              {children}
            </Heading>
          );
        },
        h3: ({ node, children }) => {
          const id =
            node?.children?.[0]?.type === 'text' ? slugify(node.children[0].value) : undefined;

          return (
            <Heading id={id} level={3}>
              {children}
            </Heading>
          );
        },
        h4: ({ node, children }) => {
          const id =
            node?.children?.[0]?.type === 'text' ? slugify(node.children[0].value) : undefined;

          return (
            <Heading id={id} level={4}>
              {children}
            </Heading>
          );
        },
        h5: ({ node, children }) => {
          const id =
            node?.children?.[0]?.type === 'text' ? slugify(node.children[0].value) : undefined;

          return (
            <Heading id={id} level={5}>
              {children}
            </Heading>
          );
        },
        a: ({ href, children }) => {
          return <Link href={href!}>{children}</Link>;
        },
        p: ({ children }) => {
          return <Paragraph>{children}</Paragraph>;
        },
        strong: ({ children }) => {
          return <span className={c('font-semibold')}>{children}</span>;
        },
        em: ({ children }) => {
          return <span className={c('italic')}>{children}</span>;
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
        img: ({ src, alt }) => {
          return <Image src={src!} alt={alt!} />;
        },
        blockquote: ({ children }) => {
          return <Quote>{children}</Quote>;
        },
        pre: ({ node, children }) => {
          // Language is set on the child <code> element
          if (
            node &&
            node.children.length === 1 &&
            node.children[0] &&
            node.children[0].type === 'element' &&
            node.children[0].tagName === 'code' &&
            node.children[0].children.length === 1 &&
            node.children[0].children[0] &&
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
          return (
            <hr
              className={c(
                'w-3/4',
                'mx-auto',
                'my-4',
                'border',
                'border-neutral-100',
                'dark:border-neutral-800',
                'rounded'
              )}
            />
          );
        }
      }}
    >
      {source}
    </ReactMarkdown>
  );
};

export default Markdown;
