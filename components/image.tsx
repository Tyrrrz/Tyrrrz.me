import { FC } from "react";
import { Head } from "vite-react-ssg";
import { resolvePath } from "../utils/assets";

type ImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

const Image: FC<ImageProps> = ({ src, alt, width, height, priority }) => {
  const actualSrc = resolvePath(src);

  return (
    <>
      {priority && (
        <Head>
          <link rel="preload" as="image" href={actualSrc} />
        </Head>
      )}

      <img
        src={actualSrc}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        width={width}
        height={height}
        style={{
          width: width ? `${width}px` : undefined,
          height: height ? `${height}px` : undefined,
        }}
      />
    </>
  );
};

export default Image;
