import styled from "@emotion/styled";
import { ReactNode } from "react";

const Container = ({
  children,
  tabsCount,
}: {
  children: ReactNode;
  tabsCount: number;
}) => {
  return <S.Container tabsCount={tabsCount}>{children}</S.Container>;
};

const Tab = ({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) => {
  return (
    <S.TabButton active={active} onClick={onClick}>
      {children}
    </S.TabButton>
  );
};

const S = {
  Container: styled.div<{ tabsCount: number }>`
    display: grid;
    grid-template-columns: repeat(${(props) => props.tabsCount}, 85px);
    justify-content: center;
    place-items: center;
    gap: 2.5rem;
  `,
  TabButton: styled.button<{ active?: boolean }>`
    all: unset;
    font-weight: ${(props) => (props.active ? "bold" : 500)};
    font-size: 0.9rem;
    cursor: pointer;

    ::after {
      display: block;
      width: 1.25rem;
      height: 3px;
      border-bottom: 3px solid
        ${(props) =>
          props.active ? "var(--colors-theme) !important" : "transparent"};
      content: "";
    }

    :hover::after {
      border-color: var(--colors-theme-transparent);
    }

    :focus-visible::after {
      border-color: var(--colors-theme-transparent);
    }
  `,
};

export default {
  Container,
  Tab,
};
