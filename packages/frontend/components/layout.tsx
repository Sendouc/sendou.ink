import styled from "@emotion/styled";
import { ReactNode } from "react";
import { HiChevronDown, HiSearch } from "react-icons/hi";
import { TextInput } from "./common/TextInput";
import NextImage from "next/image";
import logo from "../assets/img/logo.png";
import { Avatar } from "./common/Avatar";
import { Button } from "./common/Button";

const _Header = styled.header`
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
`;

const _RightContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const _LogoContainer = styled.div`
  background-color: var(--colors-bg-lighter);
  display: grid;
  place-items: center;
  padding: 0.25rem;
  border-radius: 16px;
`;

const _Main = styled.main`
  padding-top: 1rem;
`;

export function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <_Header>
        <_LogoContainer>
          <NextImage src={logo} width={30} height={30} />
        </_LogoContainer>
        <TextInput
          placeholder="Search for anything"
          icon={<HiSearch />}
          size="md"
        />
        <_RightContainer>
          <Button icon={<HiChevronDown />}>Create new...</Button>
          <Avatar src="https://cdn.discordapp.com/avatars/79237403620945920/fcfd65a3bea598905abb9ca25296816b.png?size=80" />
        </_RightContainer>
      </_Header>
      <_Main>{children}</_Main>
    </>
  );
}
