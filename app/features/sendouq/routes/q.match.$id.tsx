import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { Main } from "~/components/Main";
import { matchIdFromParams } from "../q-utils";
import type { SendouRouteHandle } from "~/utils/remix";
import { notFoundIfFalsy } from "~/utils/remix";
import { findMatchById } from "../queries/findMatchById.server";
import { Link, useLoaderData } from "@remix-run/react";
import { ModeImage, StageImage } from "~/components/Image";
import { useTranslation } from "~/hooks/useTranslation";
import { SENDOUQ_PAGE, navIconUrl, userPage } from "~/utils/urls";
import type { GroupForMatch } from "../queries/groupForMatch.server";
import { groupForMatch } from "../queries/groupForMatch.server";
import invariant from "tiny-invariant";
import { databaseTimestampToDate } from "~/utils/dates";
import { useIsMounted } from "~/hooks/useIsMounted";
import clsx from "clsx";
import styles from "../q.css";
import { Avatar } from "~/components/Avatar";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const handle: SendouRouteHandle = {
  i18n: ["q", "tournament"],
  breadcrumb: () => ({
    imgPath: navIconUrl("sendouq"),
    href: SENDOUQ_PAGE,
    type: "IMAGE",
  }),
};

export const loader = ({ params }: LoaderArgs) => {
  const matchId = matchIdFromParams(params);
  const match = notFoundIfFalsy(findMatchById(matchId));

  const groupAlpha = groupForMatch(match.alphaGroupId);
  invariant(groupAlpha, "Group alpha not found");
  const groupBravo = groupForMatch(match.bravoGroupId);
  invariant(groupBravo, "Group bravo not found");

  return {
    match,
    groupAlpha,
    groupBravo,
  };
};

// xxx: display team if in the same team, needs migration
export default function QMatchPage() {
  const isMounted = useIsMounted();
  const { i18n } = useTranslation();
  const data = useLoaderData<typeof loader>();

  return (
    <Main className="stack lg">
      <div className="q-match__header">
        <h2>Match #{data.match.id}</h2>
        <div
          className={clsx("text-xs text-lighter", {
            invisible: !isMounted,
          })}
        >
          {isMounted
            ? databaseTimestampToDate(data.match.createdAt).toLocaleString(
                i18n.language,
                {
                  day: "numeric",
                  month: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                }
              )
            : // reserve place
              "0/0/0 0:00"}
        </div>
      </div>
      <div className="q-match__teams-container">
        <MatchGroup group={data.groupAlpha} side="ALPHA" />
        <MatchGroup group={data.groupBravo} side="BRAVO" />
      </div>
      <MapList />
    </Main>
  );
}

function MatchGroup({
  group,
  side,
}: {
  group: GroupForMatch;
  side: "ALPHA" | "BRAVO";
}) {
  return (
    <div className="stack sm items-center">
      <h3 className="text-lighter">{side}</h3>
      <div className="stack sm">
        {group.members.map((member) => (
          <Link
            key={member.discordId}
            to={userPage(member)}
            className="stack horizontal xs items-center"
            target="_blank"
          >
            <Avatar size="xxs" user={member} />
            <div className="text-sm text-main-forced font-body">
              {member.discordName}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function MapList() {
  const { t } = useTranslation(["game-misc", "tournament"]);
  const data = useLoaderData<typeof loader>();

  const pickInfo = (source: string) => {
    if (source === "TIEBREAKER") return t("tournament:pickInfo.tiebreaker");
    if (source === "BOTH") return t("tournament:pickInfo.both");
    if (source === "DEFAULT") return t("tournament:pickInfo.default");

    if (source === String(data.match.alphaGroupId)) {
      return t("tournament:pickInfo.team.specific", {
        team: "Alpha",
      });
    }

    return t("tournament:pickInfo.team.specific", {
      team: "Bravo",
    });
  };

  return (
    <div className="stack sm w-max mx-auto">
      {data.match.mapList.map((map, i) => {
        return (
          <div key={i} className="stack sm horizontal items-center">
            <StageImage
              stageId={map.stageId}
              width={64}
              className="rounded-sm"
            />
            <div>
              <div className="text-sm stack horizontal xs items-center">
                {i + 1}) <ModeImage mode={map.mode} size={18} />{" "}
                {t(`game-misc:STAGE_${map.stageId}`)}
              </div>
              <div className="text-lighter text-xs">{pickInfo(map.source)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
