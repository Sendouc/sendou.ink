import { Box, Button, Flex, useColorMode } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import { FiGlobe, FiHeart, FiMoon, FiSun } from "react-icons/fi";

const TopNav = () => {
  const { colorMode } = useColorMode();
  return (
    <Flex
      justifySelf="center"
      color="white.300"
      fontWeight="bold"
      letterSpacing={1}
      justify="space-between"
      align="center"
      mb={1}
      bg="black"
    >
      <Flex justify="space-between" align="center" width="6rem" px={4}>
        {colorMode === "light" ? <FiSun /> : <FiMoon />} <FiGlobe />
      </Flex>
      <Flex justify="center" align="center" fontSize="sm">
        <Link href="/">sendou.ink</Link> <Box mx={1}>-</Box>{" "}
        <Image src={`/layout/xsearch.png`} height={24} width={24} priority />
        <Box ml={1}>Browser</Box>
      </Flex>
      <a href="https://patreon.com/sendou">
        <Button
          size="xs"
          bg="black"
          color="white"
          leftIcon={<FiHeart />}
          borderRadius="0"
          width="6rem"
          _hover={{ bg: "white", color: "black" }}
        >
          Sponsor
        </Button>
      </a>
    </Flex>
  );
};

export default TopNav;
