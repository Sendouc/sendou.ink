import { RadioGroup } from "@headlessui/react";
import * as React from "react";
import { ModeImage, StageImage } from "~/components/Image";
import { Main } from "~/components/Main";
import type { Preference, UserMapModePreferences } from "~/db/tables";
import type { ModeShort, StageId } from "~/modules/in-game-lists";
import { stageIds } from "~/modules/in-game-lists";
import { modesShort } from "~/modules/in-game-lists/modes";
import styles from "../q-settings.css";
import type { ActionArgs, LinksFunction, LoaderArgs } from "@remix-run/node";
import clsx from "clsx";
import { requireUserId } from "~/features/auth/core/user.server";
import { parseRequestFormData } from "~/utils/remix";
import { settingsActionSchema } from "../q-settings-schemas.server";
import * as QSettingsRepository from "~/features/sendouq-settings/QSettingsRepository.server";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { SubmitButton } from "~/components/SubmitButton";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const action = async ({ request }: ActionArgs) => {
  const user = await requireUserId(request);
  const data = await parseRequestFormData({
    request,
    schema: settingsActionSchema,
  });

  switch (data._action) {
    case "UPDATE_MAP_MODE_PREFERENCES": {
      await QSettingsRepository.updateUserMapModePreferences({
        mapModePreferences: data.mapModePreferences,
        userId: user.id,
      });
      break;
    }
    case "PLACEHOLDER": {
      break;
    }
  }

  return { ok: true };
};

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUserId(request);

  return {
    preferences: await QSettingsRepository.mapModePreferencesByUserId(user.id),
  };
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
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [preferences, setPreferences] = React.useState<UserMapModePreferences>(
    data.preferences ?? {
      maps: [],
      modes: [],
    },
  );

  const handleMapPreferenceChange = ({
    stageId,
    mode,
    preference,
  }: {
    stageId: StageId;
    mode: ModeShort;
    preference: Preference & "NEUTRAL";
  }) => {
    const newMapPreferences = preferences.maps.filter(
      (map) => map.stageId !== stageId || map.mode !== mode,
    );

    if (preference !== "NEUTRAL") {
      newMapPreferences.push({
        stageId,
        mode,
        preference,
      });
    }

    setPreferences({
      ...preferences,
      maps: newMapPreferences,
    });
  };

  const handleModePreferenceChange = ({
    mode,
    preference,
  }: {
    mode: ModeShort;
    preference: Preference & "NEUTRAL";
  }) => {
    const newModePreferences = preferences.modes.filter(
      (map) => map.mode !== mode,
    );

    if (preference !== "NEUTRAL") {
      newModePreferences.push({
        mode,
        preference,
      });
    }

    setPreferences({
      ...preferences,
      modes: newModePreferences,
    });
  };

  return (
    <fetcher.Form method="post">
      <input
        type="hidden"
        name="mapModePreferences"
        value={JSON.stringify(preferences)}
      />
      <h2>SendouQ map & mode preferences</h2>
      <div className="stack lg">
        <div className="stack items-center">
          {modesShort.map((modeShort) => {
            const preference = preferences.modes.find(
              (preference) => preference.mode === modeShort,
            );

            return (
              <div key={modeShort} className="stack horizontal xs my-1">
                <ModeImage mode={modeShort} width={32} />
                <PreferenceRadioGroup
                  preference={preference?.preference}
                  onPreferenceChange={(preference) =>
                    handleModePreferenceChange({ mode: modeShort, preference })
                  }
                />
              </div>
            );
          })}
        </div>

        <div className="stack lg">
          {stageIds.map((stageId) => (
            <MapModeRadios
              key={stageId}
              stageId={stageId}
              preferences={preferences.maps.filter(
                (map) => map.stageId === stageId,
              )}
              onPreferenceChange={handleMapPreferenceChange}
            />
          ))}
        </div>
      </div>
      <div className="mt-6">
        <SubmitButton
          _action="UPDATE_MAP_MODE_PREFERENCES"
          state={fetcher.state}
          className="mx-auto"
          size="big"
        >
          Save
        </SubmitButton>
      </div>
    </fetcher.Form>
  );
}

function MapModeRadios({
  stageId,
  preferences,
  onPreferenceChange,
}: {
  stageId: StageId;
  preferences: UserMapModePreferences["maps"];
  onPreferenceChange: (args: {
    stageId: StageId;
    mode: ModeShort;
    preference: Preference & "NEUTRAL";
  }) => void;
}) {
  return (
    <div className="q__map-mode-radios-container">
      <StageImage stageId={stageId} width={250} className="rounded" />
      <div className="stack justify-evenly">
        {modesShort.map((modeShort) => {
          const preference = preferences.find(
            (preference) =>
              preference.mode === modeShort && preference.stageId === stageId,
          );

          return (
            <div key={modeShort} className="stack horizontal xs my-1">
              <ModeImage mode={modeShort} width={24} />
              <PreferenceRadioGroup
                preference={preference?.preference}
                onPreferenceChange={(preference) =>
                  onPreferenceChange({ mode: modeShort, preference, stageId })
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PreferenceRadioGroup({
  preference,
  onPreferenceChange,
}: {
  preference?: Preference;
  onPreferenceChange: (preference: Preference & "NEUTRAL") => void;
}) {
  return (
    <RadioGroup
      value={preference ?? "NEUTRAL"}
      onChange={(newPreference) =>
        onPreferenceChange(newPreference as Preference & "NEUTRAL")
      }
      className="stack horizontal xs"
    >
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
    </RadioGroup>
  );
}
