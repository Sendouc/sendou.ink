import type { ActionFunction, LinksFunction } from "@remix-run/node";
import { Form, useMatches, useTransition } from "@remix-run/react";
import clsx from "clsx";
import { countries } from "countries-list";
import * as React from "react";
import { z } from "zod";
import { Button } from "~/components/Button";
import { USER_BIO_MAX_LENGTH } from "~/constants";
import { db } from "~/db";
import type { User } from "~/db/types";
import styles from "~/styles/u-edit.css";
import { parseRequestFormData, requireUser } from "~/utils/remix";
import { falsyToNull } from "~/utils/zod";
import type { UserPageLoaderData } from "../u.$identifier";

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
  bio: z.preprocess(falsyToNull, z.string().max(USER_BIO_MAX_LENGTH)),
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

export default function UserEditPage() {
  const [, parentRoute] = useMatches();
  const data = parentRoute.data as UserPageLoaderData;
  const transition = useTransition();

  return (
    <Form className="u-edit__container" method="post">
      <div>
        <label htmlFor="country">Country</label>
        <select
          className="u-edit__country-select"
          name="country"
          id="country"
          defaultValue={data.country?.code ?? ""}
          data-cy="country-select"
        >
          <option value="" />
          {Object.entries(countries).map(([code, country]) => (
            <option key={code} value={code}>
              {`${country.name} ${country.emoji}`}
            </option>
          ))}
        </select>
      </div>
      <BioTextarea initialValue={data.bio} />
      <Button
        loadingText="Saving..."
        type="submit"
        loading={transition.state === "submitting"}
        data-cy="submit-button"
      >
        Save
      </Button>
    </Form>
  );
}

function BioTextarea({ initialValue }: { initialValue: User["bio"] }) {
  const [value, setValue] = React.useState(initialValue ?? "");

  return (
    <div className="w-full">
      <div className="u-edit__bio-header">
        <label htmlFor="bio">Bio</label>
        <div
          className={clsx("u-edit__length-limit", lengthWarning(value.length))}
        >
          {value.length}/{USER_BIO_MAX_LENGTH}
        </div>
      </div>
      <textarea
        id="bio"
        name="bio"
        className="u-edit__bio-textarea"
        data-cy="bio-textarea"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={USER_BIO_MAX_LENGTH}
      />
    </div>
  );
}

function lengthWarning(length: number) {
  if (length >= USER_BIO_MAX_LENGTH) return "error";
  if (length + 100 >= USER_BIO_MAX_LENGTH) return "warning";
}
