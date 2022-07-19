import type { NextPage } from 'next';
import { FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';
import Box from '../components/box';
import Emoji from '../components/emoji';
import Image from '../components/image';
import Link from '../components/link';
import Stack from '../components/stack';

const HomePage: NextPage = () => {
  return (
    <>
      <Box classes={['container', 'm-auto', 'flex', 'items-center', 'justify-between']}>
        <Box>
          <Box classes={['text-4xl']}>Oleksii Holub</Box>
          <Box classes={['text-xl', 'font-thin']}>software developer</Box>

          <Box classes={['my-3', 'h-1', 'bg-purple-500']} />

          <Box classes={['text-xl']}>
            <Stack orientation="horizontal" gap="large">
              <Link href="https://github.com/tyrrrz">
                <FiGithub strokeWidth={1} />
              </Link>
              <Link href="https://twitter.com/tyrrrz">
                <FiTwitter strokeWidth={1} />
              </Link>
              <Link href="https://linkedin.com/in/tyrrrz">
                <FiLinkedin strokeWidth={1} />
              </Link>
            </Stack>
          </Box>
        </Box>

        <Box>
          <Image src="/logo.png" alt="picture" width={360} height={360} />
        </Box>
      </Box>

      <Box classes={['container', 'm-auto']}>
        <Box classes={['text-3xl']}>
          <Emoji code="👋" /> Hello!
        </Box>
        <Box classes={['text-xl']}>
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
          been the industrys standard dummy text ever since the 1500s, when an unknown printer took
          a galley of type and scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting, remaining essentially
          unchanged. It was popularised in the 1960s with the release of Letraset sheets containing
          Lorem Ipsum passages, and more recently with desktop publishing software like Aldus
          PageMaker including versions of Lorem Ipsum.
        </Box>
      </Box>
    </>
  );
};

export default HomePage;
