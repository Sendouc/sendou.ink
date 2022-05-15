import { Outlet } from "@remix-run/react";
import { SubNav, SubNavLink } from "~/components/SubNav";

export default function UserPageLayout() {
  return (
    <>
      <SubNav>
        <SubNavLink to="">Profile</SubNavLink>
        <SubNavLink to="edit">Edit</SubNavLink>
      </SubNav>
      <Outlet />
    </>
  );
}
