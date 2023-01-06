import type {
  LinksFunction,
  LoaderArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import React from "react";
import { Avatar } from "~/components/Avatar";
import { Flag } from "~/components/Flag";
import { WeaponImage } from "~/components/Image";
import { Main } from "~/components/Main";
import { Placement } from "~/components/Placement";
import { useTranslation } from "~/hooks/useTranslation";
import type { SendouRouteHandle } from "~/utils/remix";
import { notFoundIfFalsy } from "~/utils/remix";
import { makeTitle } from "~/utils/strings";
import { userPage } from "~/utils/urls";
import { findByIdentifier } from "../queries/findByIdentifier.server";
import { teamParamsSchema } from "../team-schemas.server";
import type { DetailedTeamMember, TeamResultPeek } from "../team-types";
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

export const handle: SendouRouteHandle = {
  i18n: ["team"],
  // breadcrumb: () => ({
  //   imgPath: navIconUrl("object-damage-calculator"),
  //   href: OBJECT_DAMAGE_CALCULATOR_URL,
  //   type: "IMAGE",
  // }),
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
      {team.results ? <ResultsBanner results={team.results} /> : <div />}
      <div className="stack lg">
        {team.members.map((member) => (
          <React.Fragment key={member.discordId}>
            <MemberRow member={member} />
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
    <div
      className={clsx("team__banner", {
        team__banner__placeholder: !team.bannerSrc,
      })}
      style={
        {
          "--team-banner-img": team.bannerSrc
            ? `url("${team.bannerSrc}")`
            : undefined,
        } as any
      }
    >
      {team.avatarSrc ? (
        <div className="team__banner__avatar">
          <div>
            <img src={team.avatarSrc} alt="" />
          </div>
        </div>
      ) : null}
      <div className="team__banner__flags">
        {team.countries.map((country) => {
          return <Flag key={country} countryCode={country} />;
        })}
      </div>
      <div className="team__banner__name">{team.name}</div>
    </div>
  );
}

// function InfoBadges() {
//   const { team } = useLoaderData<typeof loader>();

//   return (
//     <div className="team__badges">
//       {team.teamXp ? (
//         <div>
//           <Image
//             path={navIconUrl("xsearch")}
//             width={26}
//             alt="Team XP"
//             title="Team XP"
//           />
//           {team.teamXp}
//         </div>
//       ) : null}
//       {team.lutiDiv ? <div>LUTI Div {team.lutiDiv}</div> : null}
//     </div>
//   );
// }

function MobileTeamNameCountry() {
  const { team } = useLoaderData<typeof loader>();

  return (
    <div className="team__mobile-name-country">
      <div className="stack horizontal sm">
        {team.countries.map((country) => {
          return <Flag key={country} countryCode={country} tiny />;
        })}
      </div>
      {team.name}
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

function MemberRow({ member }: { member: DetailedTeamMember }) {
  const { t } = useTranslation(["team"]);

  return (
    <div className="team__member">
      {member.role ? (
        <span className="team__member__role">
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
