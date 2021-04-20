import { Box, Flex } from "@chakra-ui/react";
import MyLink from "components/common/MyLink";
import { useActiveNavItem, useMyTheme } from "hooks/common";
import Image from "next/image";
import { useRouter } from "next/router";
import { navItems } from "utils/constants";
import UserItem from "./UserItem";

const Nav = () => {
  const router = useRouter();
  const navItem = useActiveNavItem();
  const { bgColor, secondaryBgColor, themeColorHex } = useMyTheme();

  if (router.pathname === "/") return null;

  return (
    <Box
      as="nav"
      flexShrink={0}
      position="sticky"
      alignSelf="flex-start"
      display={["none", null, null, "block"]}
    >
      {navItems.map(({ code, name }) => {
        const isActive =
          code === "u" ? router.pathname === "/u" : navItem?.code === code;
        return (
          <Box
            key={code}
            borderLeft="4px solid"
            borderColor={isActive ? themeColorHex : bgColor}
            pl={2}
          >
            <MyLink href={"/" + code} isColored={false} noUnderline>
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
          </Box>
        );
      })}
      <UserItem />
    </Box>
  );
};

export default Nav;
