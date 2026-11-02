import type { Element, Text } from "hast";
import { FC } from "react";
import ReactMarkdown from "react-markdown";
import { slugify } from "../utils/url.ts";
import Code from "./code.tsx";
import Heading from "./heading.tsx";
import Image from "./image.tsx";
import Link from "./link.tsx";
import List from "./list.tsx";
import Paragraph from "./paragraph.tsx";
import Pre from "./pre.tsx";
import Quote from "./quote.tsx";
import Syntax from "./syntax.tsx";

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
            node?.children?.[0]?.type === "text" ? slugify(node.children[0].value) : undefined;

          return (
            <Heading id={id} level={1}>
              {children}
            </Heading>
          );
        },
        h2: ({ node, children }) => {
          const id =
            node?.children?.[0]?.type === "text" ? slugify(node.children[0].value) : undefined;

          return (
            <Heading id={id} level={2}>
              {children}
            </Heading>
          );
        },
        h3: ({ node, children }) => {
          const id =
            node?.children?.[0]?.type === "text" ? slugify(node.children[0].value) : undefined;

          return (
            <Heading id={id} level={3}>
              {children}
            </Heading>
          );
        },
        h4: ({ node, children }) => {
          const id =
            node?.children?.[0]?.type === "text" ? slugify(node.children[0].value) : undefined;

          return (
            <Heading id={id} level={4}>
              {children}
            </Heading>
          );
        },
        h5: ({ node, children }) => {
          const id =
            node?.children?.[0]?.type === "text" ? slugify(node.children[0].value) : undefined;

          return (
            <Heading id={id} level={5}>
              {children}
            </Heading>
          );
        },
        a: ({ href, children }) => {
          return <Link href={href || "#"}>{children}</Link>;
        },
        p: ({ children }) => {
          return <Paragraph>{children}</Paragraph>;
        },
        strong: ({ children }) => {
          return <span className="font-semibold">{children}</span>;
        },
        em: ({ children }) => {
          return <span className="italic">{children}</span>;
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
          return (
            <Image
              src={typeof src === "string" ? src : src ? URL.createObjectURL(src) : ""}
              alt={alt || ""}
            />
          );
        },
        blockquote: ({ children }) => {
          return <Quote>{children}</Quote>;
        },
        pre: ({ node, children }) => {
          const codeNode = node?.children.find(
            (child): child is Element => child.type === "element" && child.tagName === "code",
          );

          const language = /language-([A-Za-z0-9#+-]+)/u.exec(
            String(codeNode?.properties?.className || ""),
          )?.[1];

          const source =
            codeNode?.children
              ?.filter((child): child is Text => child.type === "text")
              .map((child) => child.value)
              .join("") || "";

          if (language && source) {
            return <Syntax source={source} language={language} />;
          }

          return <Pre>{children}</Pre>;
        },
        code: ({ children }) => {
          return <Code>{children}</Code>;
        },
        hr: () => {
          return (
            <hr className="mx-auto my-4 w-3/4 rounded border border-neutral-100 dark:border-neutral-800" />
          );
        },
      }}
    >
      {source}
    </ReactMarkdown>
  );
};

export default Markdown;
