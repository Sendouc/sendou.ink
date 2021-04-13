import { Box, Flex, useColorMode } from "@chakra-ui/react";
import { useActiveNavItem, useMyTheme } from "hooks/common";
import Image from "next/image";
import Link from "next/link";
import ColorModeSwitcher from "./ColorModeSwitcher";
import LanguageSwitcher from "./LanguageSwitcher";

const TopNav = () => {
  const { secondaryBgColor } = useMyTheme();
  const { colorMode, toggleColorMode } = useColorMode();
  const activeNavItem = useActiveNavItem();
  return (
    <Flex
      justifySelf="center"
      fontWeight="bold"
      letterSpacing={1}
      justify="space-between"
      align="center"
      mb={1}
      bg={secondaryBgColor}
    >
      <Flex justify="space-between" align="center" width="6rem" px={2}>
        <ColorModeSwitcher /> <LanguageSwitcher />
      </Flex>
      <Flex justify="center" align="center" fontSize="sm" color="white.300">
        <Link href="/">sendou.ink</Link>{" "}
        {activeNavItem && (
          <>
            <Box mx={1}>-</Box>{" "}
            <Image
              src={`/layout/${activeNavItem.code}.png`}
              height={24}
              width={24}
              priority
            />
            <Box ml={1}>{activeNavItem.name}</Box>
          </>
        )}
      </Flex>
      <Box width="6rem" />
    </Flex>
  );
};

export default TopNav;
