import styled from "@emotion/styled";
import { ReactNode } from "react";
import { HiChevronDown, HiSearch } from "react-icons/hi";
import { TextInput } from "./common/TextInput";
import NextImage from "next/image";
import logo from "../assets/img/logo.png";
import { Avatar } from "./common/Avatar";
import { Button } from "./common/Button";

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
      <S.Main>{children}</S.Main>
    </>
  );
}

const S = {
  Header: styled.header`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    align-items: center;
    padding: 1rem;

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
  Main: styled.main`
    padding-top: 1rem;
  `,
};
