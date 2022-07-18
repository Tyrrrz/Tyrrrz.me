import type { NextPage } from 'next';
import Box from '../components/box';
import Image from '../components/image';

const HomePage: NextPage = () => {
  return (
    <>
      <Box classes={['container', 'm-auto', 'flex', 'items-center', 'justify-between']}>
        <Box>
          <Box classes={['text-5xl']}>Oleksii Holub</Box>
          <Box classes={['text-xl', 'font-thin', 'text-right']}>software developer</Box>
        </Box>

        <Box>
          <Image src="/logo.png" alt="Picture" width={512} height={512} />
        </Box>
      </Box>
    </>
  );
};

export default HomePage;
