import styled from "@emotion/styled";
import { ReactNode } from "react";
import { HiChevronDown, HiSearch } from "react-icons/hi";
import { TextInput } from "./common/TextInput";
import NextImage from "next/image";
import logo from "../assets/img/logo.png";
import { Avatar } from "./common/Avatar";
import { Button } from "./common/Button";

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
      <S.Header>
        <S.LogoContainer>
          <NextImage src={logo} width={30} height={30} />
        </S.LogoContainer>
        <TextInput
          placeholder="Search for anything"
          icon={<HiSearch />}
          size="md"
        />
        <S.RightContainer>
          <Button icon={<HiChevronDown />}>Create new...</Button>
          <Avatar src="https://cdn.discordapp.com/avatars/79237403620945920/fcfd65a3bea598905abb9ca25296816b.png?size=80" />
        </S.RightContainer>
      </S.Header>
      <S.Nav>
        <S.NavItems>
          {navItems.map((navItem) => (
            <S.NavItemColumn>
              <S.NavGroupTitle>{navItem.title}</S.NavGroupTitle>
              {navItem.items.map((item) => (
                <a key={item} href="/">
                  <img src={`/img/nav-icons/${item.replace(" ", "")}.png`} />
                  {item}
                </a>
              ))}
            </S.NavItemColumn>
          ))}
        </S.NavItems>
      </S.Nav>
      <S.Main>{children}</S.Main>
    </>
  );
}

const S = {
  Header: styled.header`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    align-items: center;
    padding: 1rem 1rem;

    & > :first-of-type {
      justify-self: flex-start;
    }

    & > :last-of-type {
      justify-self: flex-end;
    }
  `,
  RightContainer: styled.div`
    display: flex;
    gap: 1rem;
  `,
  LogoContainer: styled.div`
    background-color: var(--colors-bg-lighter);
    // TODO: scroll image on hover? ...nav too?
    background-image: url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='%236741d9' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E");
    display: grid;
    place-items: center;
    padding: 0.25rem;
    border-radius: 16px;
  `,
  Nav: styled.nav`
    display: flex;
    justify-content: center;
    background-color: var(--colors-bg-lighter);
    // TODO: find if we can remove duplication
    background-image: url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='%236741d9' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E");
  `,
  NavItems: styled.div`
    background-color: var(--colors-bg-lighter);
    display: inline-flex;
    justify-content: center;
    gap: 3rem;
    grid-template-columns: repeat(4, 100px);
    padding: 1rem 2rem;
  `,
  NavItemColumn: styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    > a {
      display: flex;
      align-items: center;
      color: var(--colors-text);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: capitalize;
      transition: 0.2s transform;

      :hover {
        transform: translateX(2px);
      }
    }

    // TODO: figure out whether to server items from asset or public and migrate all images there
    // + if not using next image do some adjusting of the image size, format etc.
    > a > img {
      width: 1.75rem;
      margin-right: 0.5rem;
    }
  `,
  NavGroupTitle: styled.div`
    text-transform: uppercase;
    font-weight: bold;
    color: var(--colors-text-lighter);
    font-size: 0.75rem;
  `,
  Main: styled.main`
    padding-top: 2rem;
  `,
};
