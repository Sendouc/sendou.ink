import {
  Box,
  Button,
  Flex,
  Grid,
  IconButton,
  useColorMode,
} from "@chakra-ui/core";
import { DiscordIcon } from "assets/icons";
import { useTranslation } from "lib/useMockT";
import { useMyTheme } from "lib/useMyTheme";
import Link from "next/link";
import { FiMoon, FiSun } from "react-icons/fi";
import { LanguageSelector } from "./LanguageSelector";

const TopNav = () => {
  const { bgColor } = useMyTheme();
  const { colorMode, toggleColorMode } = useColorMode();

  const UserItem = () => {
    const { t } = useTranslation();

    // FIXME
    return (
      <a href="/auth/discord">
        <Button leftIcon={<DiscordIcon />} variant="ghost" size="sm">
          {t("navigation;Log in via Discord")}
        </Button>
      </a>
    );
    /*if (loading) return <Box />;
    if (!data?.user)
      return (
        <a href="/auth/discord">
          <Button leftIcon={<DiscordIcon />} variant="ghost" size="sm">
            {t("navigation;Log in via Discord")}
          </Button>
        </a>
      );
    <Link to={`/u/${data.user.discord_id}`}>
    return (
      <Menu>
        <MenuButton>
          <UserAvatar
            src={data.user.avatar}
            name={data.user.username}
            size="sm"
            m={1}
            cursor="pointer"
          />
        </MenuButton>
        <MenuList bg={darkerBgColor} color={textColor}>
          <MenuGroup title={data.user.username}>
            <Link to={`/u/${data.user.discord_id}`}>
              <MenuItem>{t("navigation;Profile")}</MenuItem>
            </Link>
            <a href="/logout">
              <MenuItem>{t("navigation;Log out")}</MenuItem>
            </a>
          </MenuGroup>
        </MenuList>
      </Menu>
    );*/
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
          aria-label={`Switch to ${
            colorMode === "light" ? "dark" : "light"
          } mode`}
          variant="ghost"
          color="current"
          fontSize="20px"
          onClick={toggleColorMode}
          icon={colorMode === "light" ? <FiSun /> : <FiMoon />}
          borderRadius="50%"
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
