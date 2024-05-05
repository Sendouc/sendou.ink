import type { MetaFunction } from "@remix-run/node";
import { Form, Link, useNavigate, useSearchParams } from "@remix-run/react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Button, LinkButton } from "~/components/Button";
import { Dialog } from "~/components/Dialog";
import { FormErrors } from "~/components/FormErrors";
import { Input } from "~/components/Input";
import { Main } from "~/components/Main";
import { Pagination } from "~/components/Pagination";
import { SubmitButton } from "~/components/SubmitButton";
import { SearchIcon } from "~/components/icons/Search";
import type { MaybeLoggedInUser } from "~/features/auth/core/user";
import { useUserOption } from "~/features/auth/core/user";
import { usePagination } from "~/hooks/usePagination";
import type { SendouRouteHandle } from "~/utils/remix";
import { TEAM_SEARCH_PAGE, navIconUrl } from "~/utils/urls";
import { TEAM, TEAMS_PER_PAGE } from "../team-constants";
import * as Schema from "@effect/schema/Schema";
import { useSchemaLoaderData } from "~/shared/services/Remix";
import { Team } from "../t-models";
import { flow, String, Match, Array, pipe, Option } from "effect";
import type { User } from "~/shared/models";

import "../team.css";

import { loader } from "../loaders/t.server";
import { action } from "../actions/t.server";
export { loader, action };

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];

  return [{ title: "Teams" }];
};

export const handle: SendouRouteHandle = {
  i18n: ["team"],
  breadcrumb: () => ({
    imgPath: navIconUrl("t"),
    href: TEAM_SEARCH_PAGE,
    type: "IMAGE",
  }),
};

export const TeamLoaderSchema = Schema.Struct({
  teams: Schema.Array(Team),
});

export default function TeamSearchPage() {
  const { t } = useTranslation(["team"]);
  const user = useUserOption();
  const [inputValue, setInputValue] = React.useState("");
  // xxx: fix useSchemaLoaderData
  const data = useSchemaLoaderData(TeamLoaderSchema) as Schema.Schema.Type<
    typeof TeamLoaderSchema
  >;

  const {
    itemsToDisplay,
    everythingVisible,
    currentPage,
    pagesCount,
    nextPage,
    previousPage,
    setPage,
  } = usePagination({
    items: filterTeams(data.teams, inputValue),
    pageSize: TEAMS_PER_PAGE,
  });

  return (
    <Main className="stack lg">
      <NewTeamDialog />
      {canViewAddNewTeamButton(user, data.teams) ? (
        <LinkButton
          size="tiny"
          to="?new=true"
          className="ml-auto"
          testId="new-team-button"
        >
          {t("team:newTeam.button")}
        </LinkButton>
      ) : null}
      <Input
        className="team-search__input"
        icon={<SearchIcon className="team-search__icon" />}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={t("team:teamSearch.placeholder")}
        testId="team-search-input"
      />
      <div className="mt-6 stack lg">
        {itemsToDisplay.map((team, i) => (
          <Link key={team.id} to={team.url} className="team-search__team">
            {Option.match(team.avatarUrl, {
              onSome: (avatarUrl) => (
                <img
                  src={avatarUrl}
                  alt=""
                  width={64}
                  height={64}
                  className="rounded-full"
                  loading="lazy"
                />
              ),
              onNone: () => (
                <div className="team-search__team__avatar-placeholder">
                  {team.name[0]}
                </div>
              ),
            })}
            <div>
              <div
                className="team-search__team__name"
                data-testid={`team-${i}`}
              >
                {team.name}
              </div>
              <div className="team-search__team__members">
                {joinTeamMemberNames(team)}
              </div>
            </div>
          </Link>
        ))}
      </div>
      {!everythingVisible ? (
        <Pagination
          currentPage={currentPage}
          pagesCount={pagesCount}
          nextPage={nextPage}
          previousPage={previousPage}
          setPage={setPage}
        />
      ) : null}
    </Main>
  );
}

const stringNormalized = flow(String.toLowerCase, String.trim);
const filterTeams = (teams: readonly Team[], inputValue: string) => {
  if (!inputValue) return teams;

  const testValue = (value: string) =>
    pipe(
      value,
      stringNormalized,
      String.includes(stringNormalized(inputValue)),
    );

  const teamMatcher = Match.type<Team>().pipe(
    Match.whenOr(
      {
        name: testValue,
      },
      {
        members: (members) =>
          members.some((member) => testValue(member.username)),
      },
      () => true,
    ),
    Match.orElse(() => false),
  );

  return Array.filter(teams, teamMatcher);
};

const memberOfSomeTeam = (user: User, teams: readonly Team[]) =>
  pipe(
    teams,
    Array.flatMap((team) => team.members),
    Array.some((member) => member.id === user.id),
  );

const canViewAddNewTeamButton = (
  user: MaybeLoggedInUser,
  teams: readonly Team[],
) =>
  Option.match(user, {
    onNone: () => false,
    onSome: (user) => !memberOfSomeTeam(user, teams),
  });

// xxx: helper module?
const joinTeamMemberNames = (team: Team) =>
  pipe(
    team.members,
    Array.map((member) => member.username),
    Array.partition((_, i) => i === team.members.length - 1),
    Array.filter((x) => !Array.isEmptyArray(x)),
    Array.map(Array.join(", ")),
    Array.join(" & "),
  );

function NewTeamDialog() {
  const { t } = useTranslation(["common", "team"]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isOpen = searchParams.get("new") === "true";

  const close = () => navigate(TEAM_SEARCH_PAGE);

  return (
    <Dialog isOpen={isOpen} close={close} className="text-center">
      <Form method="post" className="stack md">
        <h2 className="text-sm">{t("team:newTeam.header")}</h2>
        <div className="team-search__form-input-container">
          <label htmlFor="name">{t("common:forms.name")}</label>
          <input
            id="name"
            name="name"
            minLength={TEAM.NAME_MIN_LENGTH}
            maxLength={TEAM.NAME_MAX_LENGTH}
            required
            data-testid={isOpen ? "new-team-name-input" : undefined}
          />
        </div>
        <FormErrors namespace="team" />
        <div className="stack horizontal md justify-center mt-4">
          <SubmitButton>{t("common:actions.create")}</SubmitButton>
          <Button variant="destructive" onClick={close}>
            {t("common:actions.cancel")}
          </Button>
        </div>
      </Form>
    </Dialog>
  );
}
