import { FC } from "react";
import { Head } from "vite-react-ssg";

type ImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

const Image: FC<ImageProps> = ({ src, alt, width, height, priority }) => {
  return (
    <>
      {priority && (
        <Head>
          <link rel="preload" as="image" href={src} />
        </Head>
      )}

      <img
        src={src}
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
