import { Outlet } from "@remix-run/react";
import { Main } from "~/components/Main";
import { SubNav, SubNavLink } from "~/components/SubNav";

export default function UserPageLayout() {
  return (
    <>
      <SubNav>
        <SubNavLink to="">Profile</SubNavLink>
        <SubNavLink to="edit">Edit</SubNavLink>
      </SubNav>
      <Main>
        <Outlet />
      </Main>
    </>
  );
}
