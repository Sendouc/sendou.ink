import {
  redirect,
  type ActionFunction,
  type LinksFunction,
  type LoaderArgs,
} from "@remix-run/node";
import { Form, Link, useLoaderData, useMatches } from "@remix-run/react";
import { countries } from "countries-list";
import * as React from "react";
import { Trans } from "react-i18next";
import invariant from "tiny-invariant";
import { z } from "zod";
import { Button } from "~/components/Button";
import { WeaponCombobox } from "~/components/Combobox";
import { FormErrors } from "~/components/FormErrors";
import { FormMessage } from "~/components/FormMessage";
import { TrashIcon } from "~/components/icons/Trash";
import { WeaponImage } from "~/components/Image";
import { Input } from "~/components/Input";
import { Label } from "~/components/Label";
import { SubmitButton } from "~/components/SubmitButton";
import { USER } from "~/constants";
import { db } from "~/db";
import { type User } from "~/db/types";
import { useTranslation } from "~/hooks/useTranslation";
import { requireUser } from "~/modules/auth";
import { i18next } from "~/modules/i18n";
import { mainWeaponIds, type MainWeaponId } from "~/modules/in-game-lists";
import styles from "~/styles/u-edit.css";
import { translatedCountry } from "~/utils/i18n.server";
import { safeParseRequestFormData } from "~/utils/remix";
import { errorIsSqliteUniqueConstraintFailure } from "~/utils/sql";
import { rawSensToString } from "~/utils/strings";
import { FAQ_PAGE, isCustomUrl, userPage } from "~/utils/urls";
import {
  actualNumber,
  falsyToNull,
  processMany,
  removeDuplicates,
  safeJSONParse,
  undefinedToNull,
} from "~/utils/zod";
import { type UserPageLoaderData } from "../u.$identifier";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

const userEditActionSchema = z
  .object({
    country: z.preprocess(
      falsyToNull,
      z
        .string()
        .refine(
          (val) => !val || Object.keys(countries).some((code) => val === code)
        )
        .nullable()
    ),
    bio: z.preprocess(
      falsyToNull,
      z.string().max(USER.BIO_MAX_LENGTH).nullable()
    ),
    customUrl: z.preprocess(
      falsyToNull,
      z
        .string()
        .max(USER.CUSTOM_URL_MAX_LENGTH)
        .refine((val) => val === null || isCustomUrl(val), {
          message: "forms.errors.invalidCustomUrl.numbers",
        })
        .refine((val) => val === null || /^[a-zA-Z0-9-_]+$/.test(val), {
          message: "forms.errors.invalidCustomUrl.strangeCharacter",
        })
        .transform((val) => val?.toLowerCase())
        .nullable()
    ),
    stickSens: z.preprocess(
      processMany(actualNumber, undefinedToNull),
      z
        .number()
        .min(-50)
        .max(50)
        .refine((val) => val % 5 === 0)
        .nullable()
    ),
    motionSens: z.preprocess(
      processMany(actualNumber, undefinedToNull),
      z
        .number()
        .min(-50)
        .max(50)
        .refine((val) => val % 5 === 0)
        .nullable()
    ),
    inGameNameText: z.preprocess(
      falsyToNull,
      z.string().max(USER.IN_GAME_NAME_TEXT_MAX_LENGTH).nullable()
    ),
    inGameNameDiscriminator: z.preprocess(
      falsyToNull,
      z
        .string()
        .length(USER.IN_GAME_NAME_DISCRIMINATOR_LENGTH)
        .refine((val) => /^[0-9]{4}$/.test(val))
        .nullable()
    ),
    weapons: z.preprocess(
      processMany(safeJSONParse, removeDuplicates),
      z
        .array(
          z
            .number()
            .refine((val) =>
              mainWeaponIds.includes(val as typeof mainWeaponIds[number])
            )
        )
        .max(USER.WEAPON_POOL_MAX_SIZE)
    ),
  })
  .refine(
    (val) => {
      if (val.motionSens !== null && val.stickSens === null) {
        return false;
      }

      return true;
    },
    {
      message: "forms.errors.invalidSens",
    }
  );

export const action: ActionFunction = async ({ request }) => {
  const parsedInput = await safeParseRequestFormData({
    request,
    schema: userEditActionSchema,
  });

  if (!parsedInput.success) {
    return {
      errors: parsedInput.errors,
    };
  }

  const { inGameNameText, inGameNameDiscriminator, ...data } = parsedInput.data;

  const user = await requireUser(request);

  try {
    const editedUser = db.users.updateProfile({
      ...data,
      weapons: data.weapons as MainWeaponId[],
      inGameName:
        inGameNameText && inGameNameDiscriminator
          ? `${inGameNameText}#${inGameNameDiscriminator}`
          : null,
      id: user.id,
    });

    return redirect(userPage(editedUser));
  } catch (e) {
    if (!errorIsSqliteUniqueConstraintFailure(e)) {
      throw e;
    }

    return {
      errors: ["forms.errors.invalidCustomUrl.duplicate"],
    };
  }
};

export const loader = async ({ request }: LoaderArgs) => {
  const locale = await i18next.getLocale(request);

  return {
    countries: Object.entries(countries)
      .map(([code, country]) => ({
        code,
        emoji: country.emoji,
        name:
          translatedCountry({
            countryCode: code,
            language: locale,
          }) ?? country.name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
};

export default function UserEditPage() {
  const { t } = useTranslation(["common", "user"]);
  const [, parentRoute] = useMatches();
  invariant(parentRoute);
  const parentRouteData = parentRoute.data as UserPageLoaderData;

  return (
    <div className="half-width">
      <Form className="u-edit__container" method="post">
        <CustomUrlInput parentRouteData={parentRouteData} />
        <InGameNameInputs parentRouteData={parentRouteData} />
        <SensSelects parentRouteData={parentRouteData} />
        <CountrySelect parentRouteData={parentRouteData} />
        <WeaponPoolSelect parentRouteData={parentRouteData} />
        <BioTextarea initialValue={parentRouteData.bio} />
        <FormMessage type="info">
          <Trans i18nKey={"user:discordExplanation"} t={t}>
            Username, profile picture, YouTube, Twitter and Twitch accounts come
            from your Discord account. See <Link to={FAQ_PAGE}>FAQ</Link> for
            more information.
          </Trans>
        </FormMessage>
        <SubmitButton>{t("common:actions.save")}</SubmitButton>
        <FormErrors namespace="user" />
      </Form>
    </div>
  );
}

function CustomUrlInput({
  parentRouteData,
}: {
  parentRouteData: UserPageLoaderData;
}) {
  const { t } = useTranslation(["user"]);

  return (
    <div className="w-full">
      <Label htmlFor="customUrl">{t("user:customUrl")}</Label>
      <Input
        name="customUrl"
        id="customUrl"
        leftAddon="https://sendou.ink/u/"
        maxLength={USER.CUSTOM_URL_MAX_LENGTH}
        defaultValue={parentRouteData.customUrl ?? undefined}
      />
    </div>
  );
}

function InGameNameInputs({
  parentRouteData,
}: {
  parentRouteData: UserPageLoaderData;
}) {
  const { t } = useTranslation(["user"]);

  const inGameNameParts = parentRouteData.inGameName?.split("#");

  return (
    <div className="stack items-start">
      <Label>{t("user:ign")}</Label>
      <div className="stack horizontal sm">
        <Input
          className="u-edit__in-game-name-text"
          name="inGameNameText"
          aria-label="In game name"
          maxLength={USER.IN_GAME_NAME_TEXT_MAX_LENGTH}
          defaultValue={inGameNameParts?.[0]}
        />
        <div className="u-edit__in-game-name-hashtag">#</div>
        <Input
          className="u-edit__in-game-name-discriminator"
          name="inGameNameDiscriminator"
          aria-label="In game name discriminator"
          maxLength={USER.IN_GAME_NAME_DISCRIMINATOR_LENGTH}
          pattern="[0-9]{4}"
          defaultValue={inGameNameParts?.[1]}
        />
      </div>
    </div>
  );
}

const SENS_OPTIONS = [
  -50, -45, -40, -35, -30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35,
  40, 45, 50,
];
function SensSelects({
  parentRouteData,
}: {
  parentRouteData: UserPageLoaderData;
}) {
  const { t } = useTranslation(["user"]);

  return (
    <div className="stack horizontal md">
      <div>
        <Label htmlFor="stickSens">{t("user:stickSens")}</Label>
        <select
          id="stickSens"
          name="stickSens"
          defaultValue={parentRouteData.stickSens ?? undefined}
          className="u-edit__sens-select"
        >
          <option value="">{"-"}</option>
          {SENS_OPTIONS.map((sens) => (
            <option key={sens} value={sens}>
              {rawSensToString(Number(sens))}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="motionSens">{t("user:motionSens")}</Label>
        <select
          id="motionSens"
          name="motionSens"
          defaultValue={parentRouteData.motionSens ?? undefined}
          className="u-edit__sens-select"
        >
          <option value="">{"-"}</option>
          {SENS_OPTIONS.map((sens) => (
            <option key={sens} value={sens}>
              {rawSensToString(Number(sens))}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function CountrySelect({
  parentRouteData,
}: {
  parentRouteData: UserPageLoaderData;
}) {
  const { t } = useTranslation(["user"]);
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <label htmlFor="country">{t("user:country")}</label>
      <select
        className="u-edit__country-select"
        name="country"
        id="country"
        defaultValue={parentRouteData.country?.code ?? ""}
      >
        <option value="" />
        {data.countries.map((country) => (
          <option key={country.code} value={country.code}>
            {`${country.name} ${country.emoji}`}
          </option>
        ))}
      </select>
    </div>
  );
}

function WeaponPoolSelect({
  parentRouteData,
}: {
  parentRouteData: UserPageLoaderData;
}) {
  const [weapons, setWeapons] = React.useState<Array<MainWeaponId>>(
    parentRouteData.weapons
  );
  const { t } = useTranslation(["user"]);

  return (
    <div className="stack md u-edit__weapon-pool">
      <input type="hidden" name="weapons" value={JSON.stringify(weapons)} />
      <div>
        <label htmlFor="weapon">{t("user:weaponPool")}</label>
        {weapons.length < USER.WEAPON_POOL_MAX_SIZE ? (
          <WeaponCombobox
            inputName="weapon"
            id="weapon"
            onChange={(weapon) => {
              if (!weapon) return;
              setWeapons([...weapons, Number(weapon.value) as MainWeaponId]);
            }}
            weaponIdsToOmit={new Set(weapons)}
            fullWidth
          />
        ) : (
          <span className="text-xs text-warning">
            {t("user:forms.errors.maxWeapons")}
          </span>
        )}
      </div>
      <div className="stack horizontal sm justify-center">
        {weapons.map((weapon) => {
          return (
            <div key={weapon} className="stack xs">
              <div className="u__weapon">
                <WeaponImage
                  weaponSplId={weapon}
                  variant="badge"
                  width={38}
                  height={38}
                />
              </div>
              <Button
                icon={<TrashIcon />}
                variant="minimal-destructive"
                aria-label="Delete weapon"
                onClick={() => setWeapons(weapons.filter((w) => w !== weapon))}
                testId={`delete-weapon-${weapon}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BioTextarea({ initialValue }: { initialValue: User["bio"] }) {
  const { t } = useTranslation("user");
  const [value, setValue] = React.useState(initialValue ?? "");

  return (
    <div className="u-edit__bio-container">
      <Label
        htmlFor="bio"
        valueLimits={{ current: value.length, max: USER.BIO_MAX_LENGTH }}
      >
        {t("bio")}
      </Label>
      <textarea
        id="bio"
        name="bio"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={USER.BIO_MAX_LENGTH}
      />
    </div>
  );
}
