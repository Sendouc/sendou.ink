import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/Button";
import { Image } from "~/components/Image";
import { Main } from "~/components/Main";
import { YouTubeEmbed } from "~/components/YouTubeEmbed";
import { useSearchParamState } from "~/hooks/useSearchParamState";
import { useTranslation } from "~/hooks/useTranslation";
import { secondsToMinutes } from "~/utils/number";
import { notFoundIfFalsy } from "~/utils/remix";
import type { Unpacked } from "~/utils/types";
import {
  modeImageUrl,
  outlinedMainWeaponImageUrl,
  stageImageUrl,
  userPage,
} from "~/utils/urls";
import { findVodById } from "../queries/findVodById";
import type { Vod } from "../vods-types";
import styles from "../vods.css";
import * as React from "react";
import { discordFullName } from "~/utils/strings";
import { Avatar } from "~/components/Avatar";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const loader = ({ params }: LoaderArgs) => {
  const vod = notFoundIfFalsy(findVodById(Number(params["id"])));

  return { vod };
};

// xxx: 4v4 weapons
// xxx: date
export default function VodPage() {
  const [start, setStart] = useSearchParamState({
    name: "start",
    defaultValue: 0,
    revive: Number,
  });
  const [autoplay, setAutoplay] = React.useState(false);
  const data = useLoaderData<typeof loader>();

  return (
    <Main className="stack lg">
      <div className="stack sm">
        <YouTubeEmbed
          key={start}
          id={data.vod.youtubeId}
          start={start}
          autoplay={autoplay}
        />
        <h2 className="text-sm">{data.vod.title}</h2>
        <PovUser pov={data.vod.pov} />
      </div>
      <div className="vods__matches">
        {data.vod.matches.map((match) => (
          <Match
            key={match.id}
            match={match}
            setStart={(newStart) => {
              setStart(newStart);
              setAutoplay(true);
              window.scrollTo(0, 0);
            }}
          />
        ))}
      </div>
    </Main>
  );
}

function PovUser({ pov }: { pov: Vod["pov"] }) {
  if (!pov) return null;

  if (typeof pov === "string") {
    return <div className="text-sm">{pov}</div>;
  }

  return (
    <Link to={userPage(pov)} className="stack horizontal xs">
      <Avatar user={pov} size="xxs" />
      <span className="text-sm font-semi-bold">{discordFullName(pov)}</span>
    </Link>
  );
}

function Match({
  match,
  setStart,
}: {
  match: Unpacked<Vod["matches"]>;
  setStart: (start: number) => void;
}) {
  const { t } = useTranslation(["game-misc", "weapons"]);

  const weapon = match.weapons.length === 1 ? match.weapons[0]! : null;

  return (
    <div className="vods__match">
      <Image
        alt=""
        path={stageImageUrl(match.stageId)}
        width={100}
        className="rounded"
      />
      {weapon ? (
        <Image
          alt=""
          path={outlinedMainWeaponImageUrl(weapon)}
          width={42}
          className="vods__match__weapon"
        />
      ) : null}
      <Image
        alt=""
        path={modeImageUrl(match.mode)}
        width={32}
        className="vods__match__mode"
      />
      <div>
        <div>
          {t(`game-misc:MODE_SHORT_${match.mode}`)}{" "}
          {t(`game-misc:STAGE_${match.stageId}`)}
        </div>
        {weapon ? <div>{t(`weapons:MAIN_${weapon}`)}</div> : null}
      </div>
      <Button size="tiny" onClick={() => setStart(match.startsAt)}>
        {secondsToMinutes(match.startsAt)}
      </Button>
    </div>
  );
}
