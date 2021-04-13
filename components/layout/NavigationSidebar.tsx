import { Box, Flex } from "@chakra-ui/react";
import MyLink from "components/common/MyLink";
import { useMyTheme } from "hooks/common";
import Image from "next/image";
import { navItems } from "utils/constants";

const NavigationSidebar = () => {
  const { secondaryBgColor } = useMyTheme();
  return (
    <Box
      m={4}
      width="12rem"
      top={4}
      height="100vh"
      position="sticky"
      alignSelf="flex-start"
      display={["none", null, "block"]}
    >
      {navItems.map(({ code, name }) => (
        <MyLink key={code} href={"/" + code} isColored={false} noUnderline>
          <Flex
            width="100%"
            rounded="lg"
            p={2}
            fontSize="sm"
            fontWeight="bold"
            align="center"
            whiteSpace="nowrap"
            _hover={{
              bg: secondaryBgColor,
            }}
          >
            <Image
              src={`/layout/${code}.png`}
              height={32}
              width={32}
              priority
            />
            <Box ml={2}>{name}</Box>
          </Flex>
        </MyLink>
      ))}
    </Box>
  );
};

export default NavigationSidebar;
