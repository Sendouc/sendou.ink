import {
  redirect,
  type ActionFunction,
  type LinksFunction,
  type LoaderArgs,
} from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useMatches,
  useTransition,
} from "@remix-run/react";
import { countries } from "countries-list";
import * as React from "react";
import { useTranslation } from "react-i18next";
import invariant from "tiny-invariant";
import { z } from "zod";
import { Button } from "~/components/Button";
import { FormErrors } from "~/components/FormErrors";
import { Input } from "~/components/Input";
import { Label } from "~/components/Label";
import { Main } from "~/components/Main";
import { USER } from "~/constants";
import { db } from "~/db";
import { type User } from "~/db/types";
import { requireUser } from "~/modules/auth";
import { i18next } from "~/modules/i18n";
import styles from "~/styles/u-edit.css";
import { translatedCountry } from "~/utils/i18n.server";
import { safeParseRequestFormData } from "~/utils/remix";
import { errorIsSqliteUniqueConstraintFailure } from "~/utils/sql";
import { isCustomUrl, userPage } from "~/utils/urls";
import { falsyToNull, undefinedToNull } from "~/utils/zod";
import { type UserPageLoaderData } from "../u.$identifier";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

const userEditActionSchema = z.object({
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
      .refine(
        // validate val only contains numbers and letters
        (val) => val === null || /^[a-zA-Z0-9-_]+$/.test(val),
        { message: "forms.errors.invalidCustomUrl.strangeCharacter" }
      )
      .transform((val) => val?.toLowerCase())
      .nullable()
  ),
  stickSens: z.preprocess(
    undefinedToNull,
    z
      .number()
      .min(-50)
      .max(50)
      .refine((val) => val % 5 === 0)
      .nullable()
  ),
  motionSens: z.preprocess(
    undefinedToNull,
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
    z.string().length(USER.IN_GAME_NAME_DISCRIMINATOR_LENGTH).nullable()
  ),
});

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
  const { t } = useTranslation(["common"]);
  const [, parentRoute] = useMatches();
  invariant(parentRoute);
  const parentRouteData = parentRoute.data as UserPageLoaderData;
  const transition = useTransition();

  return (
    <Main>
      <Form className="u-edit__container" method="post">
        <CustomUrlInput parentRouteData={parentRouteData} />
        <InGameNameInputs parentRouteData={parentRouteData} />
        <CountrySelect parentRouteData={parentRouteData} />
        <BioTextarea initialValue={parentRouteData.bio} />
        <Button
          loadingText={t("common:actions.saving")}
          type="submit"
          loading={transition.state === "submitting"}
          data-cy="submit-button"
        >
          {t("common:actions.save")}
        </Button>
        <FormErrors namespace="user" />
      </Form>
    </Main>
  );
}

function CustomUrlInput({
  parentRouteData,
}: {
  parentRouteData: UserPageLoaderData;
}) {
  const { t } = useTranslation(["user"]);

  // xxx: fix all input widthes
  return (
    <div className="stack items-start">
      <Label htmlFor="customUrl">{t("user:customUrl")}</Label>
      <Input
        name="customUrl"
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
          maxLength={USER.IN_GAME_NAME_TEXT_MAX_LENGTH}
          defaultValue={inGameNameParts?.[0]}
        />
        <div className="u-edit__in-game-name-hashtag">#</div>
        <Input
          className="u-edit__in-game-name-discriminator"
          name="inGameNameDiscriminator"
          maxLength={USER.IN_GAME_NAME_DISCRIMINATOR_LENGTH}
          pattern="[0-9]{4}"
          defaultValue={inGameNameParts?.[1]}
        />
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
        data-cy="country-select"
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

function BioTextarea({ initialValue }: { initialValue: User["bio"] }) {
  const { t } = useTranslation("user");
  const [value, setValue] = React.useState(initialValue ?? "");

  return (
    <div className="w-full">
      <Label
        htmlFor="bio"
        valueLimits={{ current: value.length, max: USER.BIO_MAX_LENGTH }}
      >
        {t("bio")}
      </Label>
      <textarea
        id="bio"
        name="bio"
        data-cy="bio-textarea"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={USER.BIO_MAX_LENGTH}
      />
    </div>
  );
}
