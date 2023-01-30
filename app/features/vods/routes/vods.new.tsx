import LiteYouTubeEmbed from "react-lite-youtube-embed";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { Label } from "~/components/Label";
import { Main } from "~/components/Main";
import { useSearchParamState } from "~/hooks/useSearchParamState";
import { useTranslation } from "~/hooks/useTranslation";
import { type StageId, stageIds } from "~/modules/in-game-lists";
import { modesShort } from "~/modules/in-game-lists/modes";
import * as React from "react";
import type { VideoMatch, VideoMatchPlayer } from "~/db/types";
import { nanoid } from "nanoid";
import type { SendouRouteHandle } from "~/utils/remix";
import clone from "just-clone";
import { videoMatchTypes } from "../vods-constants";

export const handle: SendouRouteHandle = {
  i18n: "vods",
};

type VideoMatchBeingAdded = Partial<Omit<VideoMatch, "videoId">> & {
  id: string;
  players: Array<Omit<VideoMatchPlayer, "videoMatchId">>;
};

export default function NewVodPage() {
  // xxx: does this need to be search param?
  const [youtubeUrl, setYoutubeUrl] = useSearchParamState({
    defaultValue: "",
    name: "youtubeUrl",
    revive: (value) => value,
  });
  const [matches, setMatches] = React.useState<Array<VideoMatchBeingAdded>>([
    newMatch(),
  ]);

  const videoId = extractYoutubeIdFromVideoUrl(youtubeUrl);

  return (
    <Main halfWidth className="stack lg">
      <div>
        <Label>YouTube URL</Label>
        <Input
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
        />
      </div>
      {videoId ? (
        <>
          <LiteYouTubeEmbed id={videoId} title="" />
        </>
      ) : null}
      {matches.map((match, i) => {
        return (
          <Match
            key={match.id}
            match={match}
            number={i + 1}
            onChange={(newMatch) => {
              setMatches(
                matches.map((match, j) => (i === j ? newMatch : match))
              );
            }}
          />
        );
      })}
      <Button className="self-start">Add match</Button>
    </Main>
  );
}

function newMatch(previousMatch?: VideoMatchBeingAdded): VideoMatchBeingAdded {
  return {
    // this id is for frontend only
    id: nanoid(),
    mode: "SZ",
    eventId: previousMatch?.eventId,
    hasVc: previousMatch?.hasVc,
    type: previousMatch?.type ?? "TOURNAMENT",
    players: clone(previousMatch?.players ?? []),
  };
}

function extractYoutubeIdFromVideoUrl(url: string): string | null {
  const match = url.match(
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)$/
  );

  const found = match?.[1];
  if (!found) return null;

  const withoutSearchParams = found.split("&")[0]!;

  return withoutSearchParams;
}

// xxx: accordion design for matches?
function Match({
  match,
  onChange,
  number,
}: {
  match: VideoMatchBeingAdded;
  onChange: (match: VideoMatchBeingAdded) => void;
  number: number;
}) {
  const [minutes, setMinutes] = React.useState(0);
  const [seconds, setSeconds] = React.useState(0);

  const { t } = useTranslation(["game-misc", "vods"]);

  const handleChange = (matchWithNewFields: Partial<VideoMatchBeingAdded>) => {
    onChange({ ...match, ...matchWithNewFields });
  };

  return (
    <div className="stack md">
      <h2>{t("vods:matchCount", { count: number })}</h2>
      <div>
        <Label>Type</Label>
        <select
          value={match.type}
          onChange={(e) =>
            handleChange({ type: e.target.value as VideoMatch["type"] })
          }
        >
          {videoMatchTypes.map((type) => {
            return (
              <option key={type} value={type}>
                {t(`vods:type.${type}`)}
              </option>
            );
          })}
        </select>
      </div>

      <div>
        <Label>Start timestamp</Label>
        <div className="stack horizontal sm">
          <div className="stack horizontal sm items-center text-sm">
            <Input
              type="number"
              min={0}
              max={59}
              value={String(minutes)}
              onChange={(e) => {
                const value = Number(e.target.value);

                setMinutes(value);
                onChange({ ...match, startsAt: value * 60 + seconds });
              }}
            />
            min
          </div>
          <div className="stack horizontal sm items-center text-sm">
            <Input
              type="number"
              min={0}
              max={59}
              value={String(seconds)}
              onChange={(e) => {
                const value = Number(e.target.value);

                setSeconds(value);
                onChange({ ...match, startsAt: value + minutes * 60 });
              }}
            />
            sec
          </div>
        </div>
      </div>

      <div className="stack horizontal sm">
        <div>
          <Label>Mode</Label>
          <select
            value={match.mode}
            onChange={(e) =>
              handleChange({ mode: e.target.value as VideoMatch["mode"] })
            }
          >
            {modesShort.map((mode) => {
              return (
                <option key={mode} value={mode}>
                  {t(`game-misc:MODE_SHORT_${mode}`)}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <Label>Stage</Label>
          <select
            value={match.stageId}
            onChange={(e) =>
              handleChange({ stageId: Number(e.target.value) as StageId })
            }
          >
            {stageIds.map((stageId) => {
              return (
                <option key={stageId} value={stageId}>
                  {t(`game-misc:STAGE_${stageId}`)}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    </div>
  );
}
