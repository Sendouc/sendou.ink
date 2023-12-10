import { Link, useLoaderData } from "@remix-run/react";
import { Main } from "~/components/Main";
import { UserIcon } from "~/components/icons/User";
import { twitchThumbnailUrlToSrc } from "~/modules/twitch/utils";
import { sendouQMatchPage, twitchUrl } from "~/utils/urls";
import { cachedStreams } from "../core/streams.server";
import { Avatar } from "~/components/Avatar";
import styles from "~/features/sendouq/q.css";
import type { LinksFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { useIsMounted } from "~/hooks/useIsMounted";
import { databaseTimestampToDate } from "~/utils/dates";
import { WeaponImage } from "~/components/Image";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

// xxx: handle busting after matchs end / start somehow
export const loader = async () => {
  return {
    streams: await cachedStreams(),
  };
};

// xxx: note about why streams not showing with link to FAQ
// xxx: i18n
export default function SendouQStreamsPage() {
  const data = useLoaderData<typeof loader>();

  if (data.streams.length === 0) {
    return (
      <Main className="text-lighter text-lg font-bold text-center">
        No streamed matches currently
      </Main>
    );
  }

  return (
    <Main>
      <div className="stack horizontal lg flex-wrap justify-center">
        {data.streams.map((streamedMatch) => {
          return (
            <div key={streamedMatch.user.id} className="stack sm">
              <div className="stack horizontal justify-between items-end">
                <div className="q-stream__stream__user-container">
                  <Avatar size="xxs" user={streamedMatch.user} />{" "}
                  {streamedMatch.user.discordName}
                </div>
                <div className="q-stream__stream__viewer-count">
                  <UserIcon />
                  {streamedMatch.stream.viewerCount}
                </div>
              </div>
              <a
                href={twitchUrl(streamedMatch.user.twitch)}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  alt=""
                  src={twitchThumbnailUrlToSrc(
                    streamedMatch.stream.thumbnailUrl,
                  )}
                  width={320}
                  height={180}
                />
              </a>
              <div className="stack horizontal justify-between">
                <div className="text-sm stack horizontal sm">
                  <div>
                    <Link to={sendouQMatchPage(streamedMatch.match.id)}>
                      #{streamedMatch.match.id}
                    </Link>
                  </div>
                  <RelativeStartTime
                    startedAt={databaseTimestampToDate(
                      streamedMatch.match.createdAt,
                    )}
                  />
                </div>
                <div>
                  <WeaponImage weaponSplId={100} size={32} variant="build" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Main>
  );
}

function RelativeStartTime({ startedAt }: { startedAt: Date }) {
  const { i18n } = useTranslation();
  const isMounted = useIsMounted();

  if (!isMounted) return null;

  const minutesAgo = Math.floor((startedAt.getTime() - Date.now()) / 1000 / 60);
  const formatter = new Intl.RelativeTimeFormat(i18n.language, {
    style: "short",
  });

  return (
    <span className="text-lighter">
      {formatter.format(minutesAgo, "minute")}
    </span>
  );
}
