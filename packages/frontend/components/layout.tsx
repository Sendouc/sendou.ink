import styled from "@emotion/styled";
import { ReactNode } from "react";

const _Button = styled.button`
  padding: 32px;
  background-color: hotpink;
  font-size: 24px;
  border-radius: 4px;
  color: black;
  font-weight: bold;
  &:hover {
    color: white;
  }
`;

const Container = styled.div`
  background-color: var(--bg);
`;

export function Layout({ children }: { children: ReactNode }) {
  return (
    <Container>
      <header className="font-bold p-4">sendou.ink</header>
      <_Button>hello</_Button>
      <main>{children}</main>
    </Container>
  );
}
