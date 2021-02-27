import { Box, Flex } from "@chakra-ui/layout";
import Image from "next/image";

const TASLPage = () => {
  return (
    <>
      <Flex
        bgGradient="linear-gradient(to right, #000428, #004e92)"
        rounded="lg"
        p={4}
        fontWeight="bold"
        fontSize="lg"
        align="center"
      >
        <Image
          src="/layout/tasl_eu.png"
          height={60}
          width={60}
          alt="tasl eu logo"
        />
        <Box ml={4}>European open qualifier date to be announced</Box>
      </Flex>
      <Flex
        bgGradient="linear-gradient(to right, #200122, #6f0000)"
        rounded="lg"
        p={4}
        mt={4}
        fontWeight="bold"
        fontSize="lg"
        align="center"
      >
        <Image
          src="/layout/tasl_na.png"
          height={60}
          width={60}
          alt="tasl eu logo"
        />
        <Box ml={4}>North American open qualifier date to be announced</Box>
      </Flex>
      <Box mt={4}>
        While we are preparing Season 3 be sure to check out the best moments of
        Season 2 from YouTube!
      </Box>
    </>
  );
};

export default TASLPage;
