import type {
  LinksFunction,
  LoaderArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";
import { Button } from "~/components/Button";
import { Image, WeaponImage } from "~/components/Image";
import { Main } from "~/components/Main";
import { YouTubeEmbed } from "~/components/YouTubeEmbed";
import { useIsMounted } from "~/hooks/useIsMounted";
import { useSearchParamState } from "~/hooks/useSearchParamState";
import { useTranslation } from "~/hooks/useTranslation";
import { databaseTimestampToDate } from "~/utils/dates";
import { secondsToMinutes } from "~/utils/number";
import { notFoundIfFalsy } from "~/utils/remix";
import { makeTitle } from "~/utils/strings";
import type { Unpacked } from "~/utils/types";
import { modeImageUrl, stageImageUrl } from "~/utils/urls";
import { PovUser } from "../components/VodPov";
import { findVodById } from "../queries/findVodById";
import type { Vod } from "../vods-types";
import styles from "../vods.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = (args) => {
  const data = args.data as SerializeFrom<typeof loader> | null;

  if (!data) return {};

  return {
    title: makeTitle(data.vod.title),
  };
};

export const loader = ({ params }: LoaderArgs) => {
  const vod = notFoundIfFalsy(findVodById(Number(params["id"])));

  return { vod };
};

export default function VodPage() {
  const [start, setStart] = useSearchParamState({
    name: "start",
    defaultValue: 0,
    revive: Number,
  });
  const { i18n } = useTranslation();
  const isMounted = useIsMounted();
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
        <div className="stack horizontal sm items-center">
          <PovUser pov={data.vod.pov} />
          <time
            className={clsx("text-lighter text-xs", {
              invisible: !isMounted,
            })}
          >
            {isMounted
              ? databaseTimestampToDate(
                  data.vod.youtubeDate
                ).toLocaleDateString(i18n.language, {
                  day: "numeric",
                  month: "numeric",
                  year: "numeric",
                })
              : "t"}
          </time>
        </div>
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

function Match({
  match,
  setStart,
}: {
  match: Unpacked<Vod["matches"]>;
  setStart: (start: number) => void;
}) {
  const { t } = useTranslation(["game-misc", "weapons"]);

  const weapon = match.weapons.length === 1 ? match.weapons[0]! : null;
  const weapons = match.weapons.length === 8 ? match.weapons : null;

  return (
    <div>
      <div className="vods__match">
        <Image
          alt=""
          path={stageImageUrl(match.stageId)}
          width={100}
          className="rounded"
        />
        {weapon ? (
          <WeaponImage
            weaponSplId={weapon}
            variant="badge"
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
        <div className="vods__match__text">
          <div>
            {t(`game-misc:MODE_SHORT_${match.mode}`)}{" "}
            {t(`game-misc:STAGE_${match.stageId}`)}
          </div>
          {weapon ? <div>{t(`weapons:MAIN_${weapon}`)}</div> : null}
        </div>
        {weapons ? (
          <div className="stack horizontal md">
            <div className="vods__match__weapons">
              {weapons.slice(0, 4).map((weapon) => {
                return (
                  <WeaponImage
                    key={weapon}
                    weaponSplId={weapon}
                    variant="badge"
                    width={30}
                  />
                );
              })}
            </div>
            <div className="vods__match__weapons">
              {weapons.slice(4).map((weapon) => {
                return (
                  <WeaponImage
                    key={weapon}
                    weaponSplId={weapon}
                    variant="badge"
                    width={30}
                  />
                );
              })}
            </div>
          </div>
        ) : null}
        <Button size="tiny" onClick={() => setStart(match.startsAt)}>
          {secondsToMinutes(match.startsAt)}
        </Button>
      </div>
    </div>
  );
}
