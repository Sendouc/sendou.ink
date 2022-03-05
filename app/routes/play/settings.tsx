import clsx from "clsx";
import * as React from "react";
import {
  ActionFunction,
  Form,
  json,
  LinksFunction,
  MetaFunction,
  useLoaderData,
  useTransition,
} from "remix";
import { Button } from "~/components/Button";
import { MINI_BIO_MAX_LENGTH } from "~/constants";
import styles from "~/styles/play-settings.css";
import {
  falsyToNull,
  makeTitle,
  parseRequestFormData,
  requireUser,
} from "~/utils";
import * as User from "~/models/User.server";
import { z } from "zod";

export const meta: MetaFunction = () => {
  return {
    title: makeTitle("SendouQ settings"),
  };
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

const settingsActionSchema = z.object({
  miniBio: z.preprocess(
    falsyToNull,
    z.string().max(MINI_BIO_MAX_LENGTH).nullable()
  ),
});

export const action: ActionFunction = async ({ request, context }) => {
  const user = requireUser(context);
  const data = await parseRequestFormData({
    request,
    schema: settingsActionSchema,
  });

  await User.update({ userId: user.id, miniBio: data.miniBio });

  return null;
};

export type SettingsLoaderData = {
  miniBio?: string;
};

export const loader: ActionFunction = async ({ context }) => {
  const user = requireUser(context);

  const { miniBio } = (await User.findById(user.id)) ?? {};

  return json<SettingsLoaderData>({ miniBio: miniBio ?? undefined });
};

export default function PlaySettingsPage() {
  const data = useLoaderData<SettingsLoaderData>();
  const transition = useTransition();
  const [miniBio, setMiniBio] = React.useState(data.miniBio ?? "");

  return (
    <div>
      <Form method="post">
        <label className="play-settings__mini-bio-label" htmlFor="mini-bio">
          SendouQ Bio
        </label>
        <div className="play-settings__explanation">
          Include any information here that is useful for others to decide if
          they should group up with you. Especially anything that gives an idea
          about your current skill level.
        </div>
        <textarea
          className="play-settings__mini-bio"
          value={miniBio}
          onChange={(e) => setMiniBio(e.target.value)}
          id="mini-bio"
          name="miniBio"
        />
        <div
          className={clsx("play-settings__character-count", {
            error: miniBio.length > MINI_BIO_MAX_LENGTH,
          })}
        >
          {miniBio.length}/{MINI_BIO_MAX_LENGTH}
        </div>
        <div className="mt-4">
          <Button
            loading={transition.state === "submitting"}
            loadingText="Saving..."
          >
            Save
          </Button>
        </div>
      </Form>
    </div>
  );
}
