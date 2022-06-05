import { Outlet } from "@remix-run/react";
import { Main } from "~/components/Main";
import { SubNav, SubNavLink } from "~/components/SubNav";
import { canVoteFE } from "~/permissions";

export default function PlusPageLayout() {
  return (
    <>
      <SubNav>
        <SubNavLink to="suggestions" data-cy="profile-page-link">
          Suggestions
        </SubNavLink>
        <SubNavLink to="voting/history" data-cy="edit-page-link">
          Voting History
        </SubNavLink>
        {canVoteFE() ? (
          <SubNavLink to="voting" data-cy="edit-page-link">
            Vote
          </SubNavLink>
        ) : null}
      </SubNav>
      <Main>
        <Outlet />
      </Main>
    </>
  );
}
