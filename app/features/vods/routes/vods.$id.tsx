import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import { Button } from "~/components/Button";
import { Image } from "~/components/Image";
import { Main } from "~/components/Main";
import { useTranslation } from "~/hooks/useTranslation";
import { secondsToMinutes } from "~/utils/number";
import { notFoundIfFalsy } from "~/utils/remix";
import type { Unpacked } from "~/utils/types";
import { stageImageUrl } from "~/utils/urls";
import { findVodById } from "../queries/findVodById";
import type { Vod } from "../vods-types";
import styles from "../vods.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const loader = ({ params }: LoaderArgs) => {
  const vod = notFoundIfFalsy(findVodById(Number(params["id"])));

  return { vod };
};

export default function VodPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <Main className="stack lg">
      <div>
        <LiteYouTubeEmbed
          id={data.vod.youtubeId}
          title={data.vod.title}
          params="autoplay=1&mute=1"
        />
        <h2 className="text-sm">{data.vod.title}</h2>
      </div>
      <div className="vods__matches">
        {data.vod.matches.map((match) => (
          <Match key={match.id} match={match} />
        ))}
      </div>
    </Main>
  );
}

function Match({ match }: { match: Unpacked<Vod["matches"]> }) {
  const { t } = useTranslation(["game-misc", "weapons"]);
  return (
    <div className="vods__match">
      <Image
        alt=""
        path={stageImageUrl(match.stageId)}
        width={100}
        className="rounded"
      />
      <div>
        <div>
          {t(`game-misc:MODE_SHORT_${match.mode}`)}{" "}
          {t(`game-misc:STAGE_${match.stageId}`)}
        </div>
        {match.weapons.length === 1 ? (
          <div>{t(`weapons:MAIN_${match.weapons[0]!}`)}</div>
        ) : null}
      </div>
      <Button size="tiny">{secondsToMinutes(match.startsAt)}</Button>
    </div>
  );
}
