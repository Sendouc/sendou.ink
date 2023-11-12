import { RadioGroup } from "@headlessui/react";
import * as React from "react";
import { ModeImage, StageImage } from "~/components/Image";
import { Main } from "~/components/Main";
import type { Preference } from "~/db/tables";
import type { StageId } from "~/modules/in-game-lists";
import { stageIds } from "~/modules/in-game-lists";
import { rankedModesShort } from "~/modules/in-game-lists/modes";
import styles from "../q-settings.css";
import type { LinksFunction } from "@remix-run/node";
import clsx from "clsx";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

// xxx: sound preferences here?
export default function SendouQSettingsPage() {
  return (
    <Main>
      <MapPicker />
    </Main>
  );
}

function MapPicker() {
  return (
    <div>
      <h2>Map & mode preferences</h2>
      <div className="stack lg">
        {stageIds.map((stageId) => (
          <MapModeRadios key={stageId} stageId={stageId} />
        ))}
      </div>
    </div>
  );
}

function MapModeRadios({ stageId }: { stageId: StageId }) {
  return (
    <div className="stack horizontal sm">
      <StageImage stageId={stageId} width={250} className="rounded" />
      <div className="stack justify-between">
        {rankedModesShort.map((modeShort) => {
          return (
            <div key={modeShort} className="stack horizontal xs">
              <ModeImage mode={modeShort} width={24} />
              <PreferenceRadioGroup />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PreferenceRadioGroup() {
  const [preference, setPreference] = React.useState<Preference>();

  return (
    <RadioGroup
      value={preference ?? "NEUTRAL"}
      onChange={(newPreference) =>
        setPreference(
          newPreference === "NEUTRAL"
            ? undefined
            : (newPreference as Preference),
        )
      }
      className="stack horizontal xs"
    >
      <RadioGroup.Option value="AVOID">
        {({ checked }) => (
          <span
            className={clsx("q-settings__radio", {
              "q-settings__radio__checked": checked,
            })}
          >
            <img
              src="/static-assets/img/emoji/unamused.svg"
              className="q-settings__radio__emoji"
              width={18}
            />
            Avoid
          </span>
        )}
      </RadioGroup.Option>
      <RadioGroup.Option value="NEUTRAL">
        {({ checked }) => (
          <span
            className={clsx("q-settings__radio", {
              "q-settings__radio__checked": checked,
            })}
          >
            <img
              src="/static-assets/img/emoji/no-mouth.svg"
              className="q-settings__radio__emoji"
              width={18}
            />
            Neutral
          </span>
        )}
      </RadioGroup.Option>
      <RadioGroup.Option value="PREFER">
        {({ checked }) => (
          <span
            className={clsx("q-settings__radio", {
              "q-settings__radio__checked": checked,
            })}
          >
            <img
              src="/static-assets/img/emoji/grin.svg"
              className="q-settings__radio__emoji"
              width={18}
            />
            Prefer
          </span>
        )}
      </RadioGroup.Option>
    </RadioGroup>
  );
}
