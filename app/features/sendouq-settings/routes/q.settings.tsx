import { RadioGroup } from "@headlessui/react";
import * as React from "react";
import { ModeImage, StageImage } from "~/components/Image";
import { Main } from "~/components/Main";
import type { Preference, Tables, UserMapModePreferences } from "~/db/tables";
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
import { preferenceEmojiUrl } from "~/utils/urls";
import { MapIcon } from "~/components/icons/Map";
import { MicrophoneFilledIcon } from "~/components/icons/MicrophoneFilled";
import { assertUnreachable } from "~/utils/types";
import { RequiredHiddenInput } from "~/components/RequiredHiddenInput";
import { languagesUnified } from "~/modules/i18n/config";
import { Button } from "~/components/Button";
import { CrossIcon } from "~/components/icons/Cross";
import { useTranslation } from "~/hooks/useTranslation";

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
    case "UPDATE_VC": {
      await QSettingsRepository.updateVoiceChat({
        userId: user.id,
        vc: data.vc,
        languages: data.languages,
      });
      break;
    }
  }

  return { ok: true };
};

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUserId(request);

  return {
    preferences: await QSettingsRepository.preferencesByUserId(user.id),
  };
};

// xxx: sound preferences
// xxx: weapon preferences - remember that 0 weapons = null
// xxx: back to q button
export default function SendouQSettingsPage() {
  return (
    <Main className="stack sm">
      <h2>SendouQ settings</h2>
      <div className="stack">
        <MapPicker />
        <VoiceChat />
      </div>
    </Main>
  );
}

function MapPicker() {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [preferences, setPreferences] = React.useState<UserMapModePreferences>(
    data.preferences.mapModePreferences ?? {
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
    <details>
      <summary className="q-settings__summary">
        <div>
          <span>Stage and mode preferences</span> <MapIcon />
        </div>
      </summary>
      <fetcher.Form method="post" className="mb-4">
        <input
          type="hidden"
          name="mapModePreferences"
          value={JSON.stringify(preferences)}
        />
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
                      handleModePreferenceChange({
                        mode: modeShort,
                        preference,
                      })
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
    </details>
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
      <RadioGroup.Option value="AVOID">
        {({ checked }) => (
          <span
            className={clsx("q-settings__radio", {
              "q-settings__radio__checked": checked,
            })}
          >
            <img
              src={preferenceEmojiUrl("AVOID")}
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
              src={preferenceEmojiUrl()}
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
              src={preferenceEmojiUrl("PREFER")}
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

function VoiceChat() {
  const { t } = useTranslation(["common"]);
  const fetcher = useFetcher();

  return (
    <details>
      <summary className="q-settings__summary">
        <div>
          <span>Voice chat</span> <MicrophoneFilledIcon />
        </div>
      </summary>
      <fetcher.Form method="post" className="mb-4 stack sm">
        <VoiceChatAbility />
        <Languages />
        <div>
          <SubmitButton
            size="big"
            className="mt-2 mx-auto"
            _action="UPDATE_VC"
            state={fetcher.state}
          >
            {t("common:actions.save")}
          </SubmitButton>
        </div>
      </fetcher.Form>
    </details>
  );
}

function VoiceChatAbility() {
  const data = useLoaderData<typeof loader>();

  const label = (vc: Tables["User"]["vc"]) => {
    switch (vc) {
      case "YES":
        return "Yes";
      case "NO":
        return "No";
      case "LISTEN_ONLY":
        return "Listen only";
      default:
        assertUnreachable(vc);
    }
  };

  return (
    <div className="stack">
      <label>Voice chat</label>
      {(["YES", "NO", "LISTEN_ONLY"] as const).map((option) => {
        return (
          <div key={option} className="stack sm horizontal items-center">
            <input
              type="radio"
              name="vc"
              id={option}
              value={option}
              required
              defaultChecked={data.preferences.vc === option}
            />
            <label htmlFor={option} className="mb-0 text-main-forced">
              {label(option)}
            </label>
          </div>
        );
      })}
    </div>
  );
}

function Languages() {
  const data = useLoaderData<typeof loader>();
  const [value, setValue] = React.useState(data.preferences.languages ?? []);

  return (
    <div className="stack">
      <RequiredHiddenInput
        isValid={value.length > 0}
        name="languages"
        value={JSON.stringify(value)}
      />
      <label>Your languages</label>
      <select
        className="w-max"
        onChange={(e) => {
          const newLanguages = [...value, e.target.value].sort((a, b) =>
            a.localeCompare(b),
          );
          setValue(newLanguages);
        }}
      >
        <option value="">Select all that apply</option>
        {languagesUnified
          .filter((lang) => !value.includes(lang.code))
          .map((option) => {
            return (
              <option key={option.code} value={option.code}>
                {option.name}
              </option>
            );
          })}
      </select>
      <div className="mt-2">
        {value.map((code) => {
          const name = languagesUnified.find((l) => l.code === code)?.name;

          return (
            <div key={code} className="stack horizontal items-center sm">
              {name}{" "}
              <Button
                icon={<CrossIcon />}
                variant="minimal-destructive"
                onClick={() => {
                  const newLanguages = value.filter(
                    (codeInArr) => codeInArr !== code,
                  );
                  setValue(newLanguages);
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
