import type {
  ActionFunction,
  LinksFunction,
  LoaderFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import { countries } from "countries-list";
import { Button } from "~/components/Button";
import styles from "~/styles/u-edit.css";
import { z } from "zod";
import { falsyToNull } from "~/utils/zod";
import {
  notFoundIfFalsy,
  parseRequestFormData,
  requireUser,
} from "~/utils/remix";
import { db } from "~/db";
import type { User } from "~/db/types";
import { userParamsSchema } from "./index";

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

type UserEditLoaderData = Pick<User, "country">;

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUser(request);
  const { identifier } = userParamsSchema.parse(params);

  const userFromDb = notFoundIfFalsy(db.users.findByIdentifier(identifier));
  if (userFromDb.id !== user.id) throw new Response(null, { status: 401 });

  return json<UserEditLoaderData>({ country: userFromDb?.country });
};

export default function UserEditPage() {
  const data = useLoaderData<UserEditLoaderData>();
  const transition = useTransition();

  return (
    <Form className="u-edit__container" method="post">
      <div>
        <label htmlFor="country">Country</label>
        <select
          className="u-edit__country-select"
          name="country"
          id="country"
          defaultValue={data.country ?? ""}
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
        loadingText="Submitting..."
        type="submit"
        loading={transition.state === "submitting"}
      >
        Submit
      </Button>
    </Form>
  );
}
