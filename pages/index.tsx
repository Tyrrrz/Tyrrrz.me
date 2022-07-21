import type { NextPage } from 'next';
import { FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';
import Box from '../components/box';
import Emoji from '../components/emoji';
import Image from '../components/image';
import RawLink from '../components/rawlink';
import Stack from '../components/stack';

const HomePage: NextPage = () => {
  const age = new Date(Date.now() - Date.UTC(1995, 4, 28)).getUTCFullYear() - 1970;

  return (
    <>
      <Box classes={['flex', 'items-center', 'justify-between', 'gap-3']}>
        <Box classes={['flex-none']}>
          <Box classes={['text-3xl', 'sm:text-4xl']}>Oleksii Holub</Box>
          <Box classes={['text-xl', 'font-thin', 'tracking-wide']}>software developer</Box>

          <Box classes={['my-3', 'h-1', 'bg-purple-500']} />

          <Box classes={['text-2xl']}>
            <Stack orientation="horizontal" gap="large">
              <RawLink href="https://github.com/tyrrrz">
                <Box classes={['hover:text-blue-500']}>
                  <FiGithub strokeWidth={1} />
                </Box>
              </RawLink>
              <RawLink href="https://twitter.com/tyrrrz">
                <Box classes={['hover:text-blue-500']}>
                  <FiTwitter strokeWidth={1} />
                </Box>
              </RawLink>
              <RawLink href="https://linkedin.com/in/tyrrrz">
                <Box classes={['hover:text-blue-500']}>
                  <FiLinkedin strokeWidth={1} />
                </Box>
              </RawLink>
            </Stack>
          </Box>
        </Box>

        <Box classes={['w-64']}>
          <Image src="/logo-trans.png" alt="picture" priority />
        </Box>
      </Box>

      <Box classes={['mt-2']}>
        <Box classes={['text-2xl', 'sm:text-3xl', 'tracking-wide']}>
          <Emoji code="👋" /> Hello!
        </Box>
        <Box classes={['mt-2', 'sm:text-xl', 'space-y-2']}>
          <Box>
            My name is Oleksii, also known online as Tyrrrz. I&apos;m a {age} y/o software developer
            from Kyiv, Ukraine. I&apos;m also a Microsoft MVP and a GitHub Star.
          </Box>
          <Box>
            Most of my endeavors are in C#, but every now and then I code in F# and TypeScript as
            well. I&apos;m primarily interested in the cloud, distributed systems, and web
            applications.
          </Box>
          <Box>
            My professional hobbies involve open source, conference speaking, and blogging. Outside
            of that I&apos;m also into outdoor photography, digital art, playing guitar, and
            learning foreign languages.
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default HomePage;
