import type {
  ActionFunction,
  LinksFunction,
  LoaderArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import React from "react";
import { Avatar } from "~/components/Avatar";
import { Button, LinkButton } from "~/components/Button";
import { Flag } from "~/components/Flag";
import { FormWithConfirm } from "~/components/FormWithConfirm";
import { EditIcon } from "~/components/icons/Edit";
import { TwitterIcon } from "~/components/icons/Twitter";
import { UsersIcon } from "~/components/icons/Users";
import { WeaponImage } from "~/components/Image";
import { Main } from "~/components/Main";
import { Placement } from "~/components/Placement";
import { useTranslation } from "~/hooks/useTranslation";
import { useUser } from "~/modules/auth";
import { requireUserId } from "~/modules/auth/user.server";
import {
  notFoundIfFalsy,
  validate,
  type SendouRouteHandle,
} from "~/utils/remix";
import { makeTitle } from "~/utils/strings";
import {
  editTeamPage,
  manageTeamRosterPage,
  navIconUrl,
  teamPage,
  TEAM_SEARCH_PAGE,
  twitterUrl,
  userPage,
  userSubmittedImage,
} from "~/utils/urls";
import { findByIdentifier } from "../queries/findByIdentifier.server";
import { leaveTeam } from "../queries/leaveTeam.server";
import { teamParamsSchema } from "../team-schemas.server";
import type { DetailedTeamMember, TeamResultPeek } from "../team-types";
import { isTeamMember, isTeamOwner } from "../team-utils";
import styles from "../team.css";

export const meta: MetaFunction = ({
  data,
}: {
  data: SerializeFrom<typeof loader>;
}) => {
  if (!data) return {};

  return {
    title: makeTitle(data.team.name),
    description: data.team.bio,
  };
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireUserId(request);

  const { customUrl } = teamParamsSchema.parse(params);
  const team = notFoundIfFalsy(findByIdentifier(customUrl));

  validate(isTeamMember({ user, team }) && !isTeamOwner({ user, team }));

  leaveTeam({ userId: user.id, teamId: team.id });

  return null;
};

export const handle: SendouRouteHandle = {
  i18n: ["team"],
  breadcrumb: ({ match }) => {
    const data = match.data as SerializeFrom<typeof loader> | undefined;

    if (!data) return [];

    return [
      {
        imgPath: navIconUrl("t"),
        href: TEAM_SEARCH_PAGE,
        type: "IMAGE",
      },
      {
        text: data.team.name,
        href: teamPage(data.team.customUrl),
        type: "TEXT",
      },
    ];
  },
};

export const loader = ({ params }: LoaderArgs) => {
  const { customUrl } = teamParamsSchema.parse(params);

  const team = notFoundIfFalsy(findByIdentifier(customUrl));

  return { team };
};

export default function TeamPage() {
  const { team } = useLoaderData<typeof loader>();

  return (
    <Main className="stack lg">
      <div className="stack sm">
        <TeamBanner />
        {/* <InfoBadges /> */}
      </div>
      <MobileTeamNameCountry />
      <ActionButtons />
      {team.results ? <ResultsBanner results={team.results} /> : null}
      {team.bio ? <article data-testid="team-bio">{team.bio}</article> : null}
      <div className="stack lg">
        {team.members.map((member, i) => (
          <React.Fragment key={member.discordId}>
            <MemberRow member={member} number={i} />
            <MobileMemberCard member={member} />
          </React.Fragment>
        ))}
      </div>
    </Main>
  );
}

function TeamBanner() {
  const { team } = useLoaderData<typeof loader>();

  return (
    <>
      <div
        className={clsx("team__banner", {
          team__banner__placeholder: !team.bannerSrc,
        })}
        style={
          {
            "--team-banner-img": team.bannerSrc
              ? `url("${userSubmittedImage(team.bannerSrc)}")`
              : undefined,
          } as any
        }
      >
        {team.avatarSrc ? (
          <div className="team__banner__avatar">
            <div>
              <img src={userSubmittedImage(team.avatarSrc)} alt="" />
            </div>
          </div>
        ) : null}
        <div className="team__banner__flags">
          {team.countries.map((country) => {
            return <Flag key={country} countryCode={country} />;
          })}
        </div>
        <div className="team__banner__name">
          {team.name} <TwitterLink testId="twitter-link" />
        </div>
      </div>
      {team.avatarSrc ? <div className="team__banner__avatar__spacer" /> : null}
    </>
  );
}

function MobileTeamNameCountry() {
  const { team } = useLoaderData<typeof loader>();

  return (
    <div className="team__mobile-name-country">
      <div className="stack horizontal sm">
        {team.countries.map((country) => {
          return <Flag key={country} countryCode={country} tiny />;
        })}
      </div>
      <div className="team__mobile-team-name">
        {team.name}
        <TwitterLink />
      </div>
    </div>
  );
}

function TwitterLink({ testId }: { testId?: string }) {
  const { team } = useLoaderData<typeof loader>();

  if (!team.twitter) return null;

  return (
    <a
      className="team__twitter-link"
      href={twitterUrl(team.twitter)}
      target="_blank"
      rel="noreferrer"
      data-testid={testId}
    >
      <TwitterIcon />
    </a>
  );
}

function ActionButtons() {
  const { t } = useTranslation(["team"]);
  const user = useUser();
  const { team } = useLoaderData<typeof loader>();

  if (!isTeamMember({ user, team })) {
    return null;
  }

  return (
    <div className="team__action-buttons">
      {!isTeamOwner({ user, team }) ? (
        <FormWithConfirm
          dialogHeading={t("team:leaveTeam.header", { teamName: team.name })}
          deleteButtonText={t("team:actionButtons.leaveTeam.confirm")}
        >
          <Button
            size="tiny"
            variant="destructive"
            data-testid="leave-team-button"
          >
            {t("team:actionButtons.leaveTeam")}
          </Button>
        </FormWithConfirm>
      ) : null}
      {isTeamOwner({ user, team }) ? (
        <LinkButton
          size="tiny"
          to={manageTeamRosterPage(team.customUrl)}
          variant="outlined"
          prefetch="intent"
          icon={<UsersIcon />}
          testId="manage-roster-button"
        >
          {t("team:actionButtons.manageRoster")}
        </LinkButton>
      ) : null}
      {isTeamOwner({ user, team }) ? (
        <LinkButton
          size="tiny"
          to={editTeamPage(team.customUrl)}
          variant="outlined"
          prefetch="intent"
          icon={<EditIcon />}
          testId="edit-team-button"
        >
          {t("team:actionButtons.editTeam")}
        </LinkButton>
      ) : null}
    </div>
  );
}

function ResultsBanner({ results }: { results: TeamResultPeek }) {
  return (
    <Link className="team__results" to="results">
      <div>View {results.count} results</div>
      <ul className="team__results__placements">
        {results.placements.map(({ placement, count }) => {
          return (
            <li key={placement}>
              <Placement placement={placement} />×{count}
            </li>
          );
        })}
      </ul>
    </Link>
  );
}

function MemberRow({
  member,
  number,
}: {
  member: DetailedTeamMember;
  number: number;
}) {
  const { t } = useTranslation(["team"]);

  return (
    <div className="team__member">
      {member.role ? (
        <span
          className="team__member__role"
          data-testid={`member-row-role-${number}`}
        >
          {t(`team:roles.${member.role}`)}
        </span>
      ) : null}
      <div className="team__member__section">
        <Link
          to={userPage(member)}
          className="team__member__avatar-name-container"
        >
          <div className="team__member__avatar">
            <Avatar user={member} size="md" />
          </div>
          {member.discordName}
        </Link>
        <div className="stack horizontal md">
          {member.weapons.map((weapon) => (
            <WeaponImage
              key={weapon}
              variant="badge"
              weaponSplId={weapon}
              width={48}
              height={48}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileMemberCard({ member }: { member: DetailedTeamMember }) {
  const { t } = useTranslation(["team"]);

  return (
    <div className="team__member-card__container">
      <div className="team__member-card">
        <Link to={userPage(member)}>
          <Avatar user={member} size="md" />
          <div className="team__member-card__name">{member.discordName}</div>
        </Link>
        <div className="stack horizontal md">
          {member.weapons.map((weapon) => (
            <WeaponImage
              key={weapon}
              variant="badge"
              weaponSplId={weapon}
              width={32}
              height={32}
            />
          ))}
        </div>
      </div>
      {member.role ? (
        <span className="team__member__role__mobile">
          {t(`team:roles.${member.role}`)}
        </span>
      ) : null}
    </div>
  );
}
