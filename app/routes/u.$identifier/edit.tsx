import {
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
import { Label } from "~/components/Label";
import { Main } from "~/components/Main";
import { USER_BIO_MAX_LENGTH } from "~/constants";
import { db } from "~/db";
import { type User } from "~/db/types";
import { requireUser } from "~/modules/auth";
import { i18next } from "~/modules/i18n";
import styles from "~/styles/u-edit.css";
import { translatedCountry } from "~/utils/i18n.server";
import { parseRequestFormData } from "~/utils/remix";
import { falsyToNull } from "~/utils/zod";
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
    z.string().max(USER_BIO_MAX_LENGTH).nullable()
  ),
});

export const action: ActionFunction = async ({ request }) => {
  const data = await parseRequestFormData({
    request,
    schema: userEditActionSchema,
  });
  const user = await requireUser(request);

  db.users.updateProfile({ ...data, id: user.id });

  return null;
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
  const data = useLoaderData<typeof loader>();
  const { t } = useTranslation(["common", "user"]);
  const [, parentRoute] = useMatches();
  invariant(parentRoute);
  const parentRouteData = parentRoute.data as UserPageLoaderData;
  const transition = useTransition();

  return (
    <Main>
      <Form className="u-edit__container" method="post">
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
        <BioTextarea initialValue={parentRouteData.bio} />
        <Button
          loadingText={t("common:actions.saving")}
          type="submit"
          loading={transition.state === "submitting"}
          data-cy="submit-button"
        >
          {t("common:actions.save")}
        </Button>
      </Form>
    </Main>
  );
}

function BioTextarea({ initialValue }: { initialValue: User["bio"] }) {
  const { t } = useTranslation("user");
  const [value, setValue] = React.useState(initialValue ?? "");

  return (
    <div className="w-full">
      <Label
        htmlFor="bio"
        valueLimits={{ current: value.length, max: USER_BIO_MAX_LENGTH }}
      >
        {t("bio")}
      </Label>
      <textarea
        id="bio"
        name="bio"
        data-cy="bio-textarea"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={USER_BIO_MAX_LENGTH}
      />
    </div>
  );
}
