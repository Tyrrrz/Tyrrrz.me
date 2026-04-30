import { FC, PropsWithChildren } from "react";

type CodeProps = PropsWithChildren;

const Code: FC<CodeProps> = ({ children }) => {
  return (
    <code className="rounded border border-purple-500 bg-purple-100 px-1 font-mono text-sm dark:bg-purple-900">
      {children}
    </code>
  );
};

export default Code;
