import { Outlet } from "@remix-run/react";
import { Main } from "~/components/Main";
import { SubNav, SubNavLink } from "~/components/SubNav";

export default function PlusPageLayout() {
  return (
    <>
      <SubNav>
        <SubNavLink to="suggestions" data-cy="profile-page-link">
          Suggestions
        </SubNavLink>
        <SubNavLink to="voting/results" data-cy="edit-page-link">
          Results
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
