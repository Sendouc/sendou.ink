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
    display: grid;
    place-items: center;
    padding: 0.25rem;
    border-radius: 16px;
  `,
  Nav: styled.nav`
    background-color: var(--colors-bg-lighter);
  `,
  NavItems: styled.div`
    display: flex;
    justify-content: center;
    gap: 3rem;
    grid-template-columns: repeat(4, 100px);
    padding: 1rem 0;
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
