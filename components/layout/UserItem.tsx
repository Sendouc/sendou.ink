import { Box, Flex } from "@chakra-ui/layout";
import MyLink from "components/common/MyLink";
import UserAvatar from "components/common/UserAvatar";
import { useActiveNavItem, useMyTheme, useUser } from "hooks/common";
import { useRouter } from "next/router";

export const UserItem = () => {
  const { secondaryBgColor, themeColorHex, bgColor } = useMyTheme();
  const [user] = useUser();
  const navItem = useActiveNavItem();
  const router = useRouter();

  if (!user) return null;

  const isActive = navItem?.code === "u" && router.pathname !== "/u";

  return (
    <Box
      borderLeft="4px solid"
      borderColor={isActive ? themeColorHex : bgColor}
      pl={2}
    >
      <MyLink href={"/u/" + user.discordId} isColored={false} noUnderline>
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
          <>
            <UserAvatar user={user} size="sm" mr={1} />
            <Box ml={2}>My Page</Box>
          </>
        </Flex>
      </MyLink>
    </Box>
  );
};

export default UserItem;
