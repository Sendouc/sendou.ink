import type { LinksFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { Main } from "~/components/Main";
import { SubNav, SubNavLink } from "~/components/SubNav";
import styles from "~/styles/plus.css";
import { type SendouRouteHandle } from "~/utils/remix";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const handle: SendouRouteHandle = {
  navItemName: "plus",
};

export default function PlusPageLayout() {
  return (
    <>
      <SubNav>
        <SubNavLink to="suggestions">Suggestions</SubNavLink>
        <SubNavLink to="voting/results">Results</SubNavLink>
        <SubNavLink to="voting">Voting</SubNavLink>
      </SubNav>
      <Main>
        <Outlet />
      </Main>
    </>
  );
}
