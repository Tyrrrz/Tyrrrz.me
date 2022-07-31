import { FC } from 'react';
import { Prism } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';

type SyntaxProps = {
  source: string;
  language: string;
};

const Syntax: FC<SyntaxProps> = ({ source, language }) => {
  return (
    <Prism
      style={tomorrow}
      customStyle={{
        fontSize: '0.875rem',
        borderRadius: '0.25rem'
      }}
      language={language}
    >
      {source}
    </Prism>
  );
};

export default Syntax;
