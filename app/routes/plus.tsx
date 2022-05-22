import { Outlet } from "@remix-run/react";
import { Main } from "~/components/Main";
import { SubNav, SubNavLink } from "~/components/SubNav";

export default function UserPageLayout() {
  return (
    <>
      <SubNav>
        <SubNavLink to="" data-cy="profile-page-link">
          Profile
        </SubNavLink>
        <SubNavLink to="voting" data-cy="edit-page-link">
          Voting
        </SubNavLink>
      </SubNav>
      <Main>
        <Outlet />
      </Main>
    </>
  );
}
