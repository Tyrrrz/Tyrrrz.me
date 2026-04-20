import Giscus from '@giscus/react';
import { FC } from 'react';
import useTheme from '~/hooks/useTheme';

type BlogCommentsProps = {
  postTitle: string;
};

const BlogComments: FC<BlogCommentsProps> = ({ postTitle }) => {
  const { userPreferredTheme } = useTheme();

  return (
    <section>
      <Giscus
        repo="Tyrrrz/Tyrrrz.me"
        repoId="MDEwOlJlcG9zaXRvcnkyMDY0MDIxMDc="
        category="Blog"
        categoryId="DIC_kwDODE1yO84CT-_a"
        mapping="specific"
        strict="1"
        term={postTitle}
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={
          userPreferredTheme === 'dark'
            ? 'dark'
            : userPreferredTheme === 'light'
              ? 'light'
              : 'preferred_color_scheme'
        }
        lang="en"
        loading="lazy"
      />
    </section>
  );
};

export default BlogComments;
