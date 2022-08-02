import NextImage from 'next/image';
import { FC } from 'react';

type ImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

const Image: FC<ImageProps> = ({ src, alt, width, height, priority }) => {
  // NextJS's image component doesn't work with images of unknown size
  if (!width && !height) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} />;
  }

  return (
    <NextImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      layout="intrinsic"
    />
  );
};

export default Image;
