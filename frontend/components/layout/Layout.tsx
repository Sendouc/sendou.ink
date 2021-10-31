import { ReactNode, useState } from "react";
import NextImage from "next/image";
import NextLink from "next/link";
import logo from "assets/img/logo.png";
import { Avatar } from "components/common/Avatar";
import { styled } from "stitches.config";
import { SearchInput } from "components/common/SearchInput";
import { HamburgerButton } from "./HamburgerButton";
import { navItems } from "utils/constants";
import { MobileNav } from "./MobileNav";

export function Layout({ children }: { children: ReactNode }) {
  const [menuExpanded, setMenuExpanded] = useState(false);
  return (
    <>
      <S_Header>
        <NextLink href="/">
          <S_LogoContainer>
            <NextImage src={logo} />
          </S_LogoContainer>
        </NextLink>
        <S_SearchContainer>
          <SearchInput />
        </S_SearchContainer>
        <S_RightContainer>
          <HamburgerButton
            isExpanded={menuExpanded}
            onClick={() => setMenuExpanded((expanded) => !expanded)}
          />
          <Avatar src="https://cdn.discordapp.com/avatars/79237403620945920/fcfd65a3bea598905abb9ca25296816b.png?size=80" />
        </S_RightContainer>
      </S_Header>
      <MobileNav isExpanded={menuExpanded} />
      <S_Nav>
        <S_NavItems>
          {navItems.map((navItem) => (
            <S_NavItemColumn key={navItem.title}>
              <S_NavGroupTitle>{navItem.title}</S_NavGroupTitle>
              {navItem.items.map((item) => (
                <S_NavLink key={item} href="/">
                  <S_NavLinkImage
                    src={`/img/nav-icons/${item.replace(" ", "")}.png`}
                  />
                  {item}
                </S_NavLink>
              ))}
            </S_NavItemColumn>
          ))}
        </S_NavItems>
      </S_Nav>
      <S_Main>{children}</S_Main>
    </>
  );
}

const S_Header = styled("header", {
  position: "relative",
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  alignItems: "center",
  padding: "$4",
  "--item-size": "3rem",
  zIndex: 10,
  backgroundColor: "$bg",

  "@sm": {
    gridTemplateColumns: "repeat(3, 1fr)",
    "--item-size": "38px",
  },
});

const S_LogoContainer = styled("div", {
  backgroundColor: "$bgLighter",
  backgroundImage: `url(/svg/background-pattern.svg)`,
  display: "grid",
  placeItems: "center",
  padding: "$1",
  borderRadius: "$rounded",
  justifySelf: "flex-start",
  cursor: "pointer",
  width: "var(--item-size)",
  minWidth: "var(--item-size)",
  height: "var(--item-size)",
});

const S_SearchContainer = styled("div", {
  display: "none",

  "@sm": {
    display: "block",
  },
});

const S_RightContainer = styled("div", {
  display: "flex",
  gap: "$4",
  justifySelf: "flex-end",
});

const S_Nav = styled("nav", {
  display: "none",
  justifyContent: "center",
  backgroundColor: "$bgLighter",
  backgroundImage: `url(/svg/background-pattern.svg)`,

  "@sm": {
    display: "flex",
  },
});

const S_NavItems = styled("div", {
  backgroundColor: "$bgLighter",
  display: "inline-flex",
  justifyContent: "center",
  gap: "$12",
  gridTemplateColumns: "repeat(4, 100px)",
  paddingY: "$4",
  paddingX: "$8",
});

const S_NavItemColumn = styled("div", {
  display: "flex",
  flexDirection: "column",
  gap: "$2",
});

const S_NavLink = styled("a", {
  display: "flex",
  alignItems: "center",
  color: "$text",
  textDecoration: "none",
  fontSize: "$sm",
  fontWeight: "$bold",
  textTransform: "capitalize",
  transition: "0.2s transform",

  "&:hover": {
    transform: "translateX(2px)",
  },
});

// TODO: figure out whether to server items from asset or public and migrate all images there
// + if not using next image do some adjusting of the image size, format etc.
const S_NavLinkImage = styled("img", {
  width: "1.75rem",
  marginRight: "$2",
});

const S_NavGroupTitle = styled("div", {
  textTransform: "uppercase",
  fontWeight: "$bold",
  color: "$textLighter",
  fontSize: "$xxs",
});

const S_Main = styled("main", {
  paddingTop: "$8",
});
