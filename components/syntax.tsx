import { FC } from 'react';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import tomorrow from 'react-syntax-highlighter/dist/cjs/styles/prism/tomorrow';

type SyntaxProps = {
  source: string;
  language: string;
};

const Syntax: FC<SyntaxProps> = ({ source, language }) => {
  return (
    <SyntaxHighlighter
      style={tomorrow}
      customStyle={{
        fontSize: '0.875rem',
        borderRadius: '0.25rem'
      }}
      language={language}
    >
      {source}
    </SyntaxHighlighter>
  );
};

export default Syntax;
