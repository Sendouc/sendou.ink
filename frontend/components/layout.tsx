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
  // TODO: scroll image on hover? ...nav too?
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='%236741d9' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
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
  // TODO: find if we can remove duplication
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='%236741d9' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
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
