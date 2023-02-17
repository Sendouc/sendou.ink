import type { ActionFunction } from "@remix-run/node";
import * as React from "react";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import { Button } from "~/components/Button";
import { UserCombobox, WeaponCombobox } from "~/components/Combobox";
import { Input } from "~/components/Input";
import { Label } from "~/components/Label";
import { Main } from "~/components/Main";
import type { Video, VideoMatch } from "~/db/types";
import { useTranslation } from "~/hooks/useTranslation";
import { requireUser } from "~/modules/auth";
import {
  type MainWeaponId,
  stageIds,
  type StageId,
} from "~/modules/in-game-lists";
import { modesShort } from "~/modules/in-game-lists/modes";
import {
  databaseTimestampToDate,
  dateToDatabaseTimestamp,
} from "~/utils/dates";
import { parseRequestFormData, type SendouRouteHandle } from "~/utils/remix";
import { createVod } from "../queries/createVod";
import { videoMatchTypes } from "../vods-constants";
import { videoInputSchema } from "../vods-schemas";
import type { VideoBeingAdded, VideoMatchBeingAdded } from "../vods-types";
import { dateToYearMonthDayString } from "~/utils/dates";
import { SubmitButton } from "~/components/SubmitButton";
import { Form } from "@remix-run/react";
import { isAdmin } from "~/permissions";

export const handle: SendouRouteHandle = {
  i18n: ["vods", "calendar"],
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  const data = await parseRequestFormData({
    request,
    schema: videoInputSchema,
  });

  createVod({
    ...data.video,
    submitterUserId: user.id,
    isValidated: isAdmin(user),
  });

  // xxx: redirect
  return null;
};

export default function NewVodPage() {
  const { t } = useTranslation(["vods"]);
  const [video, setVideo] = React.useState<VideoBeingAdded>({
    type: "TOURNAMENT",
    matches: [newMatch()],
    youtubeId: "",
    title: "",
    youtubeDate: dateToDatabaseTimestamp(new Date()),
  });

  return (
    <Form method="post">
      <input type="hidden" name="video" value={JSON.stringify(video)} />
      <Main halfWidth className="stack md">
        <div>
          <Label required>YouTube URL</Label>
          <Input
            onChange={(e) =>
              setVideo({
                ...video,
                youtubeId: extractYoutubeIdFromVideoUrl(e.target.value),
              })
            }
            placeholder="https://www.youtube.com/watch?v=-dQ6JsVIKdY"
          />
        </div>

        <div>
          <Label required>Video title</Label>
          <Input
            onChange={(e) =>
              setVideo({
                ...video,
                title: e.target.value,
              })
            }
            placeholder="[SCL 47] (Grand Finals) Team Olive vs. Kraken Paradise"
          />
        </div>

        <div>
          <Label required>Video date</Label>
          <Input
            type="date"
            max={dateToYearMonthDayString(new Date())}
            value={dateToYearMonthDayString(
              databaseTimestampToDate(video.youtubeDate)
            )}
            onChange={(e) => {
              setVideo({
                ...video,
                youtubeDate: dateToDatabaseTimestamp(new Date(e.target.value)),
              });
            }}
          />
        </div>

        {video.youtubeId ? (
          <>
            <LiteYouTubeEmbed id={video.youtubeId} title="" />
          </>
        ) : null}

        <div>
          <Label required>Type</Label>
          <select
            name="type"
            value={video.type}
            onChange={(e) =>
              setVideo({ ...video, type: e.target.value as Video["type"] })
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

        {video.type !== "CAST" ? (
          <TransformingPlayerInput
            match={video}
            onChange={(newUser) => setVideo({ ...video, ...newUser })}
            toggleInputType={() => {
              const isPlainInput = typeof video.povUserName === "string";

              if (isPlainInput) {
                setVideo({
                  ...video,
                  povUserId: undefined,
                  povUserName: undefined,
                });
              } else {
                setVideo({
                  ...video,
                  povUserId: undefined,
                  povUserName: "",
                });
              }
            }}
          />
        ) : null}

        {/* xxx: Enable calendar event */}
        {/* {["TOURNAMENT", "CAST"].includes(video.type as string) ? (
        <div>
          <Label>Calendar Event</Label>
          <Input />
        </div>
      ) : null} */}

        {video.matches.map((match, i) => {
          return (
            <Match
              key={i}
              match={match}
              number={i + 1}
              onChange={(newMatch) => {
                setVideo({
                  ...video,
                  matches: video.matches.map((match, j) =>
                    i === j ? newMatch : match
                  ),
                });
              }}
              type={video.type}
            />
          );
        })}
        <div className="stack horizontal md justify-end">
          <Button
            className="self-start mt-4"
            variant="outlined"
            onClick={() =>
              setVideo({
                ...video,
                matches: [...video.matches, newMatch()],
              })
            }
            size="tiny"
          >
            Add match
          </Button>
          {video.matches.length > 1 ? (
            <Button
              className="self-start mt-4"
              variant="destructive"
              onClick={() =>
                setVideo({
                  ...video,
                  matches: video.matches.filter(
                    (_, i) => i !== video.matches.length - 1
                  ),
                })
              }
              size="tiny"
            >
              Delete match
            </Button>
          ) : null}
        </div>

        <div className="stack items-start">
          <SubmitButton size="big">Submit</SubmitButton>
        </div>
      </Main>
    </Form>
  );
}

function newMatch(): VideoMatchBeingAdded {
  return { weapons: [], mode: "SZ", stageId: 1, startsAt: 0 };
}

function extractYoutubeIdFromVideoUrl(url: string): string {
  const match = url.match(
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)$/
  );

  const found = match?.[1];
  if (!found) return "";

  const withoutSearchParams = found.split("&")[0]!;

  return withoutSearchParams;
}

function TransformingPlayerInput({
  match,
  onChange,
  toggleInputType,
}: {
  match: Pick<VideoBeingAdded, "povUserId" | "povUserName">;
  onChange: (match: Pick<VideoBeingAdded, "povUserId" | "povUserName">) => void;
  toggleInputType: () => void;
}) {
  const { t } = useTranslation(["calendar"]);

  // if null or number we render combobox
  const asPlainInput = typeof match.povUserName === "string";

  return (
    <div>
      <div className="stack horizontal md items-center mb-1">
        <Label required htmlFor="pov" className="mb-0">
          Player (PoV)
        </Label>
        <Button
          size="tiny"
          variant="minimal"
          onClick={toggleInputType}
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
          value={match.povUserName ?? ""}
          onChange={(e) => onChange({ ...match, povUserName: e.target.value })}
          // xxx: max length
          // max={CALENDAR_EVENT_RESULT.MAX_PLAYER_NAME_LENGTH}
        />
      ) : (
        <UserCombobox
          id="pov"
          inputName="team-player"
          initialUserId={match.povUserId}
          onChange={(selected) =>
            onChange({
              ...match,
              povUserId: selected?.value ? Number(selected.value) : undefined,
            })
          }
        />
      )}
    </div>
  );
}

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
  const id = React.useId();
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
        <Label required>Start timestamp</Label>
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
          <Label required>Mode</Label>
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
          <Label required>Stage</Label>
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

      {/* xxx: many weapons for cast */}
      <div className="stack sm">
        {type === "CAST" ? null : (
          <>
            <Label required htmlFor={id}>
              Weapon
            </Label>
            <WeaponCombobox
              fullWidth
              id={id}
              inputName="weapon"
              initialWeaponId={match.weapons[0] as MainWeaponId}
              onChange={(selected) =>
                onChange({
                  ...match,
                  weapons: selected?.value
                    ? [Number(selected.value) as MainWeaponId]
                    : [],
                })
              }
            />
          </>
        )}
      </div>
    </div>
  );
}
