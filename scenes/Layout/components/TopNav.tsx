import {
  Avatar,
  Box,
  Button,
  Flex,
  Grid,
  IconButton,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
  useColorMode,
} from "@chakra-ui/core";
import { DiscordIcon } from "assets/icons";
import { useTranslation } from "lib/useMockT";
import { useMyTheme } from "lib/useMyTheme";
import useUser from "lib/useUser";
import { signIn, signOut } from "next-auth/client";
import Link from "next/link";
import { FiMoon, FiSun } from "react-icons/fi";
import { LanguageSelector } from "./LanguageSelector";

const TopNav = () => {
  const { bgColor, secondaryBgColor } = useMyTheme();
  const { colorMode, toggleColorMode } = useColorMode();

  const UserItem = () => {
    const { t } = useTranslation();
    const [user, loading] = useUser();

    if (loading) return <Box />;

    if (!user) {
      return (
        <Button
          onClick={() => signIn("discord")}
          leftIcon={<DiscordIcon />}
          variant="ghost"
          size="sm"
        >
          {t("navigation;Log in via Discord")}
        </Button>
      );
    }

    return (
      <Menu>
        <MenuButton>
          <Avatar
            src={
              user.discordAvatar
                ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png`
                : undefined
            }
            name={user.username}
            size="sm"
            m={1}
            cursor="pointer"
          />
        </MenuButton>
        <MenuList bg={secondaryBgColor}>
          <MenuGroup title={`${user.username}#${user.discriminator}`}>
            <Link href={`/u/${user.discordId}`}>
              <MenuItem>{t("navigation;Profile")}</MenuItem>
            </Link>
            <MenuItem onClick={() => signOut()}>
              {t("navigation;Log out")}
            </MenuItem>
          </MenuGroup>
        </MenuList>
      </Menu>
    );
  };

  return (
    <Grid
      templateColumns={["1fr 1fr", null, "1fr 1fr 1fr"]}
      bg={bgColor}
      w="100%"
      alignItems="center"
      justifyContent="space-between"
      p={1}
    >
      <Flex alignItems="center">
        <IconButton
          data-cy="color-mode-toggle"
          aria-label={`Switch to ${
            colorMode === "light" ? "dark" : "light"
          } mode`}
          variant="ghost"
          color="current"
          fontSize="20px"
          onClick={toggleColorMode}
          icon={colorMode === "light" ? <FiSun /> : <FiMoon />}
          mr="5px"
          isRound
        />
        <LanguageSelector />
      </Flex>
      <Box
        justifySelf="center"
        fontFamily="Rubik, sans-serif"
        color="gray.600"
        fontWeight="bold"
        letterSpacing={1}
        display={["none", null, "block"]}
      >
        {" "}
        <Link href="/">sendou.ink </Link>
      </Box>
      <Box justifySelf="flex-end">
        <UserItem />
      </Box>
    </Grid>
  );
};

export default TopNav;
