import type {
  ActionFunction,
  LinksFunction,
  LoaderArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import * as React from "react";
import { Button, LinkButton } from "~/components/Button";
import { Dialog } from "~/components/Dialog";
import { FormErrors } from "~/components/FormErrors";
import { SearchIcon } from "~/components/icons/Search";
import { Input } from "~/components/Input";
import { Main } from "~/components/Main";
import { SubmitButton } from "~/components/SubmitButton";
import { useTranslation } from "~/hooks/useTranslation";
import { getUser, requireUser, useUser } from "~/modules/auth";
import { i18next } from "~/modules/i18n";
import { joinListToNaturalString } from "~/utils/arrays";
import type { SendouRouteHandle } from "~/utils/remix";
import { parseRequestFormData, validate } from "~/utils/remix";
import { makeTitle } from "~/utils/strings";
import {
  mySlugify,
  navIconUrl,
  teamPage,
  TEAM_SEARCH_PAGE,
  userSubmittedImage,
} from "~/utils/urls";
import { allTeams } from "../queries/allTeams.server";
import { createNewTeam } from "../queries/createNewTeam.server";
import { TEAM } from "../team-constants";
import { createTeamSchema } from "../team-schemas.server";
import styles from "../team.css";

export const meta: MetaFunction = ({
  data,
}: {
  data: SerializeFrom<typeof loader>;
}) => {
  if (!data) return {};

  return {
    title: data.title,
  };
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  const data = await parseRequestFormData({
    request,
    schema: createTeamSchema,
  });

  const teams = allTeams();

  // user creating team isn't in a team yet
  validate(
    teams.every((team) => team.members.every((member) => member.id !== user.id))
  );

  // two teams can't have same customUrl
  const customUrl = mySlugify(data.name);
  if (teams.some((team) => team.customUrl === customUrl)) {
    return {
      errors: ["forms.errors.duplicateName"],
    };
  }

  createNewTeam({
    captainId: user.id,
    name: data.name,
    customUrl,
  });

  return redirect(teamPage(customUrl));
};

export const handle: SendouRouteHandle = {
  i18n: ["team"],
  breadcrumb: () => ({
    imgPath: navIconUrl("t"),
    href: TEAM_SEARCH_PAGE,
    type: "IMAGE",
  }),
};

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUser(request);
  const t = await i18next.getFixedT(request);

  const teams = allTeams().sort((teamA, teamB) => {
    // show own team first always
    if (user && teamA.members.some((m) => m.id === user.id)) {
      return -1;
    }

    if (user && teamB.members.some((m) => m.id === user.id)) {
      return 1;
    }

    // then full teams
    if (teamA.members.length >= 4 && teamB.members.length < 4) {
      return -1;
    }

    if (teamA.members.length < 4 && teamB.members.length >= 4) {
      return 1;
    }

    // and as tiebreaker teams with a higher plus server tier member first
    const lowestATeamPlusTier = Math.min(
      ...teamA.members.map((m) => m.plusTier ?? Infinity)
    );
    const lowestBTeamPlusTier = Math.min(
      ...teamB.members.map((m) => m.plusTier ?? Infinity)
    );

    if (lowestATeamPlusTier > lowestBTeamPlusTier) {
      return 1;
    }

    if (lowestATeamPlusTier < lowestBTeamPlusTier) {
      return -1;
    }

    return 0;
  });

  return {
    title: makeTitle(t("pages.t")),
    teams,
    isMemberOfTeam: !user
      ? false
      : teams.some((t) => t.members.some((m) => m.id === user.id)),
  };
};

export default function TeamSearchPage() {
  const { t } = useTranslation(["team"]);
  const user = useUser();
  const [inputValue, setInputValue] = React.useState("");
  const data = useLoaderData<typeof loader>();

  const filteredTeams = data.teams.filter((team) => {
    if (!inputValue) return true;

    const lowerCaseInput = inputValue.toLowerCase();

    if (team.name.toLowerCase().includes(lowerCaseInput)) return true;
    if (
      team.members.some((m) =>
        m.discordName.toLowerCase().includes(lowerCaseInput)
      )
    ) {
      return true;
    }

    return false;
  });

  return (
    <Main className="stack lg">
      <NewTeamDialog />
      {user && !data.isMemberOfTeam ? (
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
        {filteredTeams.map((team, i) => (
          <Link
            key={team.customUrl}
            to={teamPage(team.customUrl)}
            className="team-search__team"
          >
            {team.avatarSrc ? (
              <img
                src={userSubmittedImage(team.avatarSrc)}
                alt=""
                width={64}
                height={64}
                className="rounded-full"
                loading="lazy"
              />
            ) : (
              <div className="team-search__team__avatar-placeholder">
                {team.name[0]}
              </div>
            )}
            <div>
              <div
                className="team-search__team__name"
                data-testid={`team-${i}`}
              >
                {team.name}
              </div>
              <div className="team-search__team__members">
                {team.members.length === 1
                  ? team.members[0]!.discordName
                  : joinListToNaturalString(
                      team.members.map((member) => member.discordName),
                      "&"
                    )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Main>
  );
}

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
            data-testid="new-team-name-input"
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
