import { RadioGroup } from "@headlessui/react";
import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";
import { Button } from "~/components/Button";
import { WeaponCombobox } from "~/components/Combobox";
import { ModeImage, StageImage, WeaponImage } from "~/components/Image";
import { Main } from "~/components/Main";
import { SubmitButton } from "~/components/SubmitButton";
import { CrossIcon } from "~/components/icons/Cross";
import { MapIcon } from "~/components/icons/Map";
import { MicrophoneFilledIcon } from "~/components/icons/MicrophoneFilled";
import { PuzzleIcon } from "~/components/icons/Puzzle";
import { SpeakerFilledIcon } from "~/components/icons/SpeakerFilled";
import { TrashIcon } from "~/components/icons/Trash";
import type { Preference, Tables, UserMapModePreferences } from "~/db/tables";
import { requireUserId } from "~/features/auth/core/user.server";
import {
  soundCodeToLocalStorageKey,
  soundVolume,
} from "~/features/chat/chat-utils";
import * as QSettingsRepository from "~/features/sendouq-settings/QSettingsRepository.server";
import { useIsMounted } from "~/hooks/useIsMounted";
import { useTranslation } from "react-i18next";
import { languagesUnified } from "~/modules/i18n/config";
import type { MainWeaponId, ModeShort, StageId } from "~/modules/in-game-lists";
import { stageIds } from "~/modules/in-game-lists";
import { modesShort } from "~/modules/in-game-lists/modes";
import { type SendouRouteHandle, parseRequestFormData } from "~/utils/remix";
import { assertUnreachable } from "~/utils/types";
import {
  SENDOUQ_PAGE,
  SENDOUQ_SETTINGS_PAGE,
  navIconUrl,
  preferenceEmojiUrl,
} from "~/utils/urls";
import { SENDOUQ_WEAPON_POOL_MAX_SIZE } from "../q-settings-constants";
import { settingsActionSchema } from "../q-settings-schemas.server";
import styles from "../q-settings.css";
import { BANNED_MAPS } from "../banned-maps";
import { Divider } from "~/components/Divider";
import { useState } from "react";
import { soundPath } from "~/utils/urls";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const handle: SendouRouteHandle = {
  i18n: ["q"],
  breadcrumb: () => [
    {
      imgPath: navIconUrl("sendouq"),
      href: SENDOUQ_PAGE,
      type: "IMAGE",
    },
    {
      imgPath: navIconUrl("settings"),
      href: SENDOUQ_SETTINGS_PAGE,
      type: "IMAGE",
    },
  ],
};

export const action = async ({ request }: ActionFunctionArgs) => {
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
    case "UPDATE_SENDOUQ_WEAPON_POOL": {
      await QSettingsRepository.updateSendouQWeaponPool({
        userId: user.id,
        weaponPool: data.weaponPool,
      });
      break;
    }
    default: {
      assertUnreachable(data);
    }
  }

  return { ok: true };
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUserId(request);

  return {
    settings: await QSettingsRepository.settingsByUserId(user.id),
  };
};

export default function SendouQSettingsPage() {
  return (
    <Main className="stack sm">
      <div className="stack">
        <MapPicker />
        <WeaponPool />
        <VoiceChat />
        <Sounds />
      </div>
    </Main>
  );
}

function MapPicker() {
  const { t } = useTranslation(["q", "common"]);
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [preferences, setPreferences] = React.useState<UserMapModePreferences>(
    data.settings.mapModePreferences ?? {
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
          <span>{t("q:settings.maps.header")}</span> <MapIcon />
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
            {t("common:actions.save")}
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
  const { t } = useTranslation(["q", "game-misc"]);

  return (
    <div className="q-settings__map-mode-radios-container">
      <div className="stack items-center text-uppercase text-lighter text-xs font-bold">
        {t(`game-misc:STAGE_${stageId}`)}
        <StageImage stageId={stageId} width={250} className="rounded" />
      </div>
      <div className="stack justify-evenly">
        {modesShort.map((modeShort) => {
          const preference = preferences.find(
            (preference) =>
              preference.mode === modeShort && preference.stageId === stageId,
          );

          const isBanned = BANNED_MAPS[modeShort].includes(stageId);

          return (
            <div key={modeShort} className="stack horizontal xs my-1">
              <ModeImage mode={modeShort} width={24} />
              {isBanned ? (
                <Divider className="q-settings__banned">
                  {t("q:settings.banned")}
                </Divider>
              ) : (
                <PreferenceRadioGroup
                  preference={preference?.preference}
                  onPreferenceChange={(preference) =>
                    onPreferenceChange({ mode: modeShort, preference, stageId })
                  }
                />
              )}
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
  const { t } = useTranslation(["q"]);

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
            {t("q:settings.maps.avoid")}
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
            {t("q:settings.maps.neutral")}
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
            {t("q:settings.maps.prefer")}
          </span>
        )}
      </RadioGroup.Option>
    </RadioGroup>
  );
}

function VoiceChat() {
  const { t } = useTranslation(["common", "q"]);
  const fetcher = useFetcher();

  return (
    <details>
      <summary className="q-settings__summary">
        <div>
          <span>{t("q:settings.voiceChat.header")}</span>{" "}
          <MicrophoneFilledIcon />
        </div>
      </summary>
      <fetcher.Form method="post" className="mb-4 ml-2-5 stack sm">
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
  const { t } = useTranslation(["q"]);
  const data = useLoaderData<typeof loader>();

  const label = (vc: Tables["User"]["vc"]) => {
    switch (vc) {
      case "YES":
        return t("q:settings.voiceChat.canVC.yes");
      case "NO":
        return t("q:settings.voiceChat.canVC.no");
      case "LISTEN_ONLY":
        return t("q:settings.voiceChat.canVC.listenOnly");
      default:
        assertUnreachable(vc);
    }
  };

  return (
    <div className="stack">
      <label>{t("q:settings.voiceChat.canVC.header")}</label>
      {(["YES", "NO", "LISTEN_ONLY"] as const).map((option) => {
        return (
          <div key={option} className="stack sm horizontal items-center">
            <input
              type="radio"
              name="vc"
              id={option}
              value={option}
              required
              defaultChecked={data.settings.vc === option}
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
  const { t } = useTranslation(["q"]);
  const data = useLoaderData<typeof loader>();
  const [value, setValue] = React.useState(data.settings.languages ?? []);

  return (
    <div className="stack">
      <input type="hidden" name="languages" value={JSON.stringify(value)} />
      <label>{t("q:settings.voiceChat.languages.header")}</label>
      <select
        className="w-max"
        onChange={(e) => {
          const newLanguages = [...value, e.target.value].sort((a, b) =>
            a.localeCompare(b),
          );
          setValue(newLanguages);
        }}
      >
        <option value="">
          {t("q:settings.voiceChat.languages.placeholder")}
        </option>
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

function WeaponPool() {
  const { t } = useTranslation(["common", "q"]);
  const data = useLoaderData<typeof loader>();
  const [weapons, setWeapons] = React.useState(data.settings.qWeaponPool ?? []);
  const fetcher = useFetcher();

  const latestWeapon = weapons[weapons.length - 1];

  return (
    <details>
      <summary className="q-settings__summary">
        <div>
          <span>{t("q:settings.weaponPool.header")}</span> <PuzzleIcon />
        </div>
      </summary>
      <fetcher.Form method="post" className="mb-4 stack items-center">
        <input
          type="hidden"
          name="weaponPool"
          value={JSON.stringify(weapons)}
        />
        <div className="q-settings__weapon-pool-select-container">
          {weapons.length < SENDOUQ_WEAPON_POOL_MAX_SIZE ? (
            <div>
              <WeaponCombobox
                inputName="weapon"
                id="weapon"
                onChange={(weapon) => {
                  if (!weapon) return;
                  setWeapons([
                    ...weapons,
                    Number(weapon.value) as MainWeaponId,
                  ]);
                }}
                // empty on selection
                key={latestWeapon ?? "empty"}
                weaponIdsToOmit={new Set(weapons)}
                fullWidth
              />
            </div>
          ) : (
            <span className="text-xs text-info">
              {t("q:settings.weaponPool.full")}
            </span>
          )}
        </div>
        <div className="stack horizontal sm justify-center">
          {weapons.map((weapon) => {
            return (
              <div key={weapon} className="stack xs">
                <div>
                  <WeaponImage
                    weaponSplId={weapon}
                    variant="badge"
                    width={38}
                    height={38}
                  />
                </div>
                <div className="stack sm horizontal items-center justify-center">
                  <Button
                    icon={<TrashIcon />}
                    variant="minimal-destructive"
                    aria-label="Delete weapon"
                    onClick={() =>
                      setWeapons(weapons.filter((w) => w !== weapon))
                    }
                    size="tiny"
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6">
          <SubmitButton
            size="big"
            className="mx-auto"
            _action="UPDATE_SENDOUQ_WEAPON_POOL"
            state={fetcher.state}
          >
            {t("common:actions.save")}
          </SubmitButton>
        </div>
      </fetcher.Form>
    </details>
  );
}

function Sounds() {
  const { t } = useTranslation(["q"]);
  const isMounted = useIsMounted();

  return (
    <details>
      <summary className="q-settings__summary">
        <div>
          <span>{t("q:settings.sounds.header")}</span> <SpeakerFilledIcon />
        </div>
      </summary>
      {isMounted && <SoundCheckboxes />}
      {isMounted && <SoundSlider />}
    </details>
  );
}

function SoundCheckboxes() {
  const { t } = useTranslation(["q"]);

  const sounds = [
    {
      code: "sq_like",
      name: t("q:settings.sounds.likeReceived"),
    },
    {
      code: "sq_new-group",
      name: t("q:settings.sounds.groupNewMember"),
    },
    {
      code: "sq_match",
      name: t("q:settings.sounds.matchStarted"),
    },
  ];

  // default to true
  const currentValue = (code: string) =>
    !localStorage.getItem(soundCodeToLocalStorageKey(code)) ||
    localStorage.getItem(soundCodeToLocalStorageKey(code)) === "true";

  const [soundValues, setSoundValues] = React.useState(
    Object.fromEntries(
      sounds.map((sound) => [sound.code, currentValue(sound.code)]),
    ),
  );

  // toggle in local storage
  const toggleSound = (code: string) => {
    localStorage.setItem(
      soundCodeToLocalStorageKey(code),
      String(!currentValue(code)),
    );
    setSoundValues((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  };

  return (
    <div className="ml-2-5">
      {sounds.map((sound) => (
        <div key={sound.code}>
          <label className="stack horizontal xs items-center">
            <input
              type="checkbox"
              checked={soundValues[sound.code]}
              onChange={() => toggleSound(sound.code)}
            />
            {sound.name}
          </label>
        </div>
      ))}
    </div>
  );
}

function SoundSlider() {
  const [volume, setVolume] = useState(() => {
    return soundVolume() || 100;
  });

  const changeVolume = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);

    setVolume(newVolume);

    localStorage.setItem(
      "settings__sound-volume",
      String(Math.floor(newVolume)),
    );
  };

  const playSound = () => {
    const audio = new Audio(soundPath("sq_like"));
    audio.volume = soundVolume() / 100;
    audio.play();
  };

  return (
    <div className="stack horizontal xs items-center ml-2-5">
      <SpeakerFilledIcon className="q-settings__volume-slider-icon" />
      <input
        className="q-settings__volume-slider-input"
        type="range"
        value={volume}
        onChange={changeVolume}
        onTouchEnd={playSound}
        onMouseUp={playSound}
      />
    </div>
  );
}
