import type { ActionFunction, LinksFunction } from "@remix-run/node";
import { Form, useMatches, useTransition } from "@remix-run/react";
import { countries } from "countries-list";
import { z } from "zod";
import { Button } from "~/components/Button";
import { db } from "~/db";
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
