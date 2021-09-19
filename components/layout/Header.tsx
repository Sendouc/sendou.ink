import {
  Button,
  IconButton,
  useColorMode,
  useMediaQuery,
} from "@chakra-ui/react";
import MyLink from "components/common/MyLink";
import { useActiveNavItem, useUser } from "hooks/common";
import { signIn, signOut } from "next-auth/client";
import Image from "next/image";
import Link from "next/link";
import { FiHeart, FiLogIn, FiLogOut, FiMenu } from "react-icons/fi";
import ColorModeSwitcher from "./ColorModeSwitcher";
import LanguageSwitcher from "./LanguageSwitcher";
import styles from "./Header.module.css";

const Header = ({ openNav }: { openNav: () => void }) => {
  const [isSmall] = useMediaQuery("(max-width: 400px)");
  const [user] = useUser();
  const { colorMode } = useColorMode();
  const activeNavItem = useActiveNavItem();

  return (
    <header className={styles.container}>
      <div className={styles.leftIconsContainer}>
        <ColorModeSwitcher /> <LanguageSwitcher />
        <IconButton
          aria-label="Open menu"
          variant="ghost"
          color="current"
          onClick={openNav}
          icon={<FiMenu />}
          _hover={
            colorMode === "dark"
              ? { bg: "white !important", color: "black" }
              : { bg: "black !important", color: "white" }
          }
          borderRadius="0"
          display={["flex", null, null, "none"]}
        />
      </div>
      <div className="flex justify-center align-center">
        <Link href="/">{isSmall ? "s.ink" : "sendou.ink"}</Link>{" "}
        {activeNavItem && (
          <>
            <div className="mx-1">-</div>{" "}
            <Image
              src={`/layout/${
                activeNavItem.imageSrc ?? activeNavItem.code
              }.png`}
              className={
                activeNavItem.code === "splatoon3" ? "rounded" : undefined
              }
              height={36}
              width={36}
              priority
              alt={`${activeNavItem.name} icon`}
            />
            <div className="ml-1">{activeNavItem.name}</div>
          </>
        )}
      </div>
      <div>
        <MyLink isExternal isColored={false} href="https://patreon.com/sendou">
          <Button
            variant="ghost"
            color="current"
            leftIcon={<FiHeart />}
            _hover={
              colorMode === "dark"
                ? { bg: "white !important", color: "black" }
                : { bg: "black !important", color: "white" }
            }
            borderRadius="0"
            size="xs"
            px={2}
            height="50px"
            mr="0.5rem"
            display={["none", null, null, "inline-block"]}
          >
            Sponsor
          </Button>
        </MyLink>
        <Button
          width="6rem"
          data-cy="color-mode-toggle"
          aria-label="Log in"
          variant="ghost"
          color="current"
          onClick={() => (user ? signOut() : signIn("discord"))}
          leftIcon={user ? <FiLogOut /> : <FiLogIn />}
          _hover={
            colorMode === "dark"
              ? { bg: "white !important", color: "black" }
              : { bg: "black !important", color: "white" }
          }
          borderRadius="0"
          size="xs"
          px={2}
          height="50px"
          ml="0.5rem"
        >
          {user ? "Log out" : "Log in"}
        </Button>
      </div>
    </header>
  );
};

export default Header;
