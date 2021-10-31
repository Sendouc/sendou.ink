import { SearchInput } from "components/common/SearchInput";
import { styled } from "stitches.config";
import { navItems } from "utils/constants";
import NextLink from "next/link";
import { Fragment } from "react";

export function MobileNav({ isExpanded }: { isExpanded: boolean }) {
  return (
    <S_Container
      aria-hidden={isExpanded ? "false" : "true"}
      type={isExpanded ? "expanded" : undefined}
    >
      <S_TopAction>
        <SearchInput />
      </S_TopAction>
      <S_LinksContainer>
        {navItems.map((navItem) => {
          return (
            <Fragment key={navItem.title}>
              <S_GroupTitle>{navItem.title}</S_GroupTitle>
              {navItem.items.map((item) => {
                return (
                  <NextLink key={item} href="/">
                    <S_NavLink>
                      <S_NavLinkImage
                        src={`/img/nav-icons/${item.replace(" ", "")}.png`}
                      />
                      <div>{item}</div>
                    </S_NavLink>
                  </NextLink>
                );
              })}
            </Fragment>
          );
        })}
      </S_LinksContainer>
    </S_Container>
  );
}

const S_Container = styled("nav", {
  position: "absolute",
  bottom: "100vh",
  width: "100%",
  height: "100%",
  transition: "bottom 0.5s",
  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
  backgroundImage: `url(/svg/background-pattern.svg)`,
  backgroundColor: "$bgLighter",
  zIndex: 5,
  overflowY: "auto",
  paddingBottom: "$6",

  "@sm": {
    display: "none",
  },

  variants: {
    type: {
      expanded: {
        bottom: "0",
      },
    },
  },
});

const S_TopAction = styled("div", {
  display: "grid",
  gap: "$4",
  placeItems: "center",
  backgroundColor: "$bg",
  paddingTop: "$24",
  paddingBottom: "$8",
});

const S_LinksContainer = styled("div", {
  display: "grid",
  justifyContent: "center",
  gridAutoColumns: "1fr",
  gridAutoRows: "4rem",
  paddingX: "$24",
});

const S_NavLinkImage = styled("img", {
  width: "2.5rem",
  marginRight: "$3",
});

const S_GroupTitle = styled("div", {
  textTransform: "uppercase",
  alignSelf: "flex-end",
  justifySelf: "center",
  paddingX: "$3",
  paddingY: "$2",
  marginBottom: "$1",
  backgroundColor: "$bg",
  fontWeight: "$bold",
});

const S_NavLink = styled("div", {
  display: "flex",
  alignItems: "center",
  textTransform: "capitalize",
  borderTop: "3px solid $bgLighter",
  fontWeight: "$bold",
  backgroundColor: "$bg",
  paddingX: "$2",
  fontSize: "$sm",

  "&:last-child": {
    borderBottom: "3px solid $bgLighter",
  },
});
