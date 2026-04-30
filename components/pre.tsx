import { FC, PropsWithChildren } from "react";

type PreProps = PropsWithChildren;

const Pre: FC<PreProps> = ({ children }) => {
  return (
    <pre className="overflow-auto rounded border border-purple-500 bg-purple-100 p-4 dark:bg-purple-900 [&>code]:border-none [&>code]:p-0">
      {children}
    </pre>
  );
};

export default Pre;
