import type {
  LinksFunction,
  LoaderArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Image, WeaponImage } from "~/components/Image";
import { Main } from "~/components/Main";
import type { SendouRouteHandle } from "~/utils/remix";
import { notFoundIfFalsy } from "~/utils/remix";
import { makeTitle } from "~/utils/strings";
import { navIconUrl, userPage } from "~/utils/urls";
import { findByIdentifier } from "../queries/findByIdentifier.server";
import { teamParamsSchema } from "../team-schemas.server";
import { Placement } from "~/components/Placement";
import styles from "../team.css";
import type { DetailedTeamMember } from "../team-types";
import { Avatar } from "~/components/Avatar";
import { useTranslation } from "~/hooks/useTranslation";

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
        <InfoBadges />
      </div>
      <ResultsBanner />
      <div className="stack lg">
        {team.members.map((member) => (
          <MemberRow key={member.discordId} member={member} />
        ))}
      </div>
    </Main>
  );
}

function TeamBanner() {
  const { team } = useLoaderData<typeof loader>();

  return (
    <div
      className="team__banner"
      style={
        {
          // xxx: some fallback banner image
          "--team-banner-img": team.bannerSrc ? `url("${team.bannerSrc}")` : "",
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
        {/* xxx: map to real flags */}
        <img
          src="https://twemoji.maxcdn.com/v/latest/svg/1f1eb-1f1ee.svg"
          alt="Flag of Finland"
          width={48}
        />
      </div>
      <div className="team__banner__name">{team.name}</div>
    </div>
  );
}

function InfoBadges() {
  const { team } = useLoaderData<typeof loader>();

  return (
    <div className="team__badges">
      {team.teamXp ? (
        <div>
          <Image
            path={navIconUrl("xsearch")}
            width={26}
            alt="Team XP"
            title="Team XP"
          />
          {team.teamXp}
        </div>
      ) : null}
      {team.lutiDiv ? <div>LUTI Div {team.lutiDiv}</div> : null}
    </div>
  );
}

function ResultsBanner() {
  const { team } = useLoaderData<typeof loader>();

  if (!team.results) return null;

  return (
    <Link className="team__results" to="results">
      <div>View {team.results.count} results</div>
      <ul className="team__results__placements">
        {team.results.placements.map(({ placement, count }) => {
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
