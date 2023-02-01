import clone from "just-clone";
import { nanoid } from "nanoid";
import * as React from "react";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import { Button } from "~/components/Button";
import { UserCombobox } from "~/components/Combobox";
import { Input } from "~/components/Input";
import { Label } from "~/components/Label";
import { Main } from "~/components/Main";
import type { Video, VideoMatch, VideoMatchPlayer } from "~/db/types";
import { useSearchParamState } from "~/hooks/useSearchParamState";
import { useTranslation } from "~/hooks/useTranslation";
import { stageIds, type StageId } from "~/modules/in-game-lists";
import { modesShort } from "~/modules/in-game-lists/modes";
import type { SendouRouteHandle } from "~/utils/remix";
import { videoMatchTypes } from "../vods-constants";

export const handle: SendouRouteHandle = {
  i18n: ["vods", "calendar"],
};

type VideoMatchBeingAddedPlayer = Partial<
  Omit<VideoMatchPlayer, "videoMatchId" | "isPov" | "team">
>;
type VideoMatchBeingAdded = Partial<Omit<VideoMatch, "videoId">> & {
  id: string;
  players: Array<VideoMatchBeingAddedPlayer>;
};

export default function NewVodPage() {
  const { t } = useTranslation(["vods"]);
  // xxx: does this need to be search param?
  const [youtubeUrl, setYoutubeUrl] = useSearchParamState({
    defaultValue: "",
    name: "youtubeUrl",
    revive: (value) => value,
  });
  const [matches, setMatches] = React.useState<Array<VideoMatchBeingAdded>>([
    newMatch(),
  ]);
  const [eventType, setEventType] = React.useState<Video["type"]>("TOURNAMENT");

  const videoId = extractYoutubeIdFromVideoUrl(youtubeUrl);

  // xxx: hide other inputs except youtube url if videoId is null

  return (
    <Main halfWidth className="stack md">
      <div>
        <Label>YouTube URL</Label>
        <Input
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
        />
      </div>
      <div>
        <Label>Type</Label>
        <select
          name="type"
          value={eventType}
          onChange={(e) => setEventType(e.target.value as Video["type"])}
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
        <Label>Calendar Event</Label>
        <Input />
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
            type={eventType}
          />
        );
      })}
      {/* xxx: delete match */}
      <Button
        className="self-start mt-4"
        variant="outlined"
        onClick={() =>
          setMatches([...matches, newMatch(matches[matches.length - 1])])
        }
      >
        Add match
      </Button>
    </Main>
  );
}

function newMatch(previousMatch?: VideoMatchBeingAdded): VideoMatchBeingAdded {
  return {
    // this id is for frontend only
    id: nanoid(),
    mode: "SZ",
    players: clone(previousMatch?.players ?? [{ playerUserId: null }]),
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
  type,
}: {
  match: VideoMatchBeingAdded;
  onChange: (match: VideoMatchBeingAdded) => void;
  number: number;
  type: Video["type"];
}) {
  const [minutes, setMinutes] = React.useState(0);
  const [seconds, setSeconds] = React.useState(0);

  const { t } = useTranslation(["game-misc", "vods"]);

  const handleChange = (matchWithNewFields: Partial<VideoMatchBeingAdded>) => {
    onChange({ ...match, ...matchWithNewFields });
  };

  return (
    <div className="stack md">
      <h2>{t("vods:gameCount", { count: number })}</h2>

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

      {/* 
        xxx: cast inputs:

        team 1 weapons
        inputs
        x y z

        team 2 weapons
        inputs
        x y z
      */}
      <TransformingPlayerInput
        type={type}
        player={match.players[0]!}
        onChange={(newPlayer) => console.log("TODO: handle newPlayer")}
      />
      {/* xxx: single player weapon input */}
    </div>
  );
}

function TransformingPlayerInput({
  type,
  player,
  onChange,
}: {
  type: Video["type"];
  player: VideoMatchBeingAddedPlayer;
  onChange: (match: VideoMatchBeingAdded) => void;
}) {
  const { t } = useTranslation(["calendar"]);

  if (type === "CAST") return null;

  // if null or number we render combobox
  const asPlainInput = player.playerUserId === undefined;

  return (
    <div>
      <div className="stack horizontal md items-center mb-1">
        <label htmlFor="pov" className="mb-0">
          Player (PoV)
        </label>
        <Button
          size="tiny"
          variant="minimal"
          // onClick={() => setAsPlainInput(!asPlainInput)}
          className="outline-theme"
        >
          {asPlainInput
            ? t("calendar:forms.team.player.addAsUser")
            : t("calendar:forms.team.player.addAsText")}
        </Button>
      </div>
      {asPlainInput ? (
        <input
          id="pov"
          // value={player}
          // onChange={(e) => handleInputChange(i, e.target.value)}
          // max={CALENDAR_EVENT_RESULT.MAX_PLAYER_NAME_LENGTH}
        />
      ) : (
        <UserCombobox
          id="pov"
          inputName="team-player"
          // initialUserId={player.id}
          // onChange={(selected) =>
          //   handleInputChange(
          //     i,
          //     selected?.value ? Number(selected?.value) : NEW_PLAYER.id
          //   )
          // }
        />
      )}
    </div>
  );
}
