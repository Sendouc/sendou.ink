import { ReactNode } from "react";
import NextImage from "next/image";
import logo from "../assets/img/logo.png";
import { Avatar } from "./common/Avatar";
import { styled } from "stitches.config";
import { SearchInput } from "./common/SearchInput";

const navItems = [
  {
    title: "builds",
    items: ["browse", "gear", "analyzer"],
  },
  {
    title: "play",
    items: ["calendar", "battle", "Rankings"],
  },
  {
    title: "tools",
    items: ["planner", "rotations", "top 500"],
  },
  {
    title: "misc",
    items: ["badges", "links"],
  },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <S_Header>
        <S_LogoContainer>
          <NextImage src={logo} width={30} height={30} />
        </S_LogoContainer>
        <SearchInput />
        <S_RightContainer>
          <Avatar src="https://cdn.discordapp.com/avatars/79237403620945920/fcfd65a3bea598905abb9ca25296816b.png?size=80" />
        </S_RightContainer>
      </S_Header>
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
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  alignItems: "center",
  padding: "$4",
});

const S_LogoContainer = styled("div", {
  backgroundColor: "$bgLighter",
  backgroundImage: `url(/svg/background-pattern.svg)`,
  display: "grid",
  placeItems: "center",
  padding: "$1",
  borderRadius: "$rounded",
  justifySelf: "flex-start",
});

const S_RightContainer = styled("div", {
  display: "flex",
  gap: "$4",
  justifySelf: "flex-end",
});

const S_Nav = styled("nav", {
  display: "flex",
  justifyContent: "center",
  backgroundColor: "$bgLighter",
  backgroundImage: `url(/svg/background-pattern.svg)`,
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
