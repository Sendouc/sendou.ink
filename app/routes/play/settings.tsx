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
import {
  LFG_WEAPON_POOL_MAX_LENGTH,
  MINI_BIO_MAX_LENGTH,
  weapons,
} from "~/constants";
import styles from "~/styles/play-settings.css";
import {
  falsyToNull,
  makeTitle,
  parseRequestFormData,
  requireUser,
  safeJSONParse,
} from "~/utils";
import * as User from "~/models/User.server";
import { z } from "zod";
import { Combobox } from "~/components/Combobox";
import { WeaponImage } from "~/components/WeaponImage";

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
  weapons: z.preprocess(
    safeJSONParse,
    z.array(z.enum(weapons)).max(LFG_WEAPON_POOL_MAX_LENGTH)
  ),
});

export const action: ActionFunction = async ({ request, context }) => {
  const user = requireUser(context);
  const data = await parseRequestFormData({
    request,
    schema: settingsActionSchema,
  });

  await User.update({
    userId: user.id,
    miniBio: data.miniBio,
    weapons: data.weapons,
  });

  return null;
};

export type SettingsLoaderData = {
  miniBio?: string;
  weapons: string[];
};

export const loader: ActionFunction = async ({ context }) => {
  const user = requireUser(context);

  const { miniBio, weapons } = (await User.findById(user.id)) ?? {};

  return json<SettingsLoaderData>({
    miniBio: miniBio ?? undefined,
    weapons: weapons ?? [],
  });
};

export default function PlaySettingsPage() {
  const data = useLoaderData<SettingsLoaderData>();
  const transition = useTransition();
  const [miniBio, setMiniBio] = React.useState(data.miniBio ?? "");
  const [weaponPool, setWeaponPool] = React.useState(data.weapons);

  return (
    <div>
      <Form method="post">
        <input
          type="hidden"
          name="weapons"
          value={JSON.stringify(weaponPool)}
        />
        <label className="play-settings__label" htmlFor="mini-bio">
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
        <label className="play-settings__label mt-4" htmlFor="weapon-pool">
          Weapon pool
        </label>
        <div className="play-settings__explanation">
          What are your preferred weapons to play? Select up to{" "}
          {LFG_WEAPON_POOL_MAX_LENGTH}.
        </div>
        <Combobox
          options={weapons.filter((wpn) => !weaponPool.includes(wpn))}
          onChange={(val) => setWeaponPool((pool) => [...pool, val])}
          inputName="weapon-pool"
          placeholder="Luna Blaster"
        />
        <ol className="play-settings__weapons">
          {weaponPool.map((wpn, i) => (
            <li key={wpn} className="play-settings__weapon-row">
              <WeaponImage className="play-settings__weapon" weapon={wpn} />{" "}
              {i + 1}) {wpn}{" "}
              <Button
                className="ml-auto"
                tiny
                type="button"
                onClick={() =>
                  setWeaponPool((pool) =>
                    pool.filter((weaponInPool) => weaponInPool !== wpn)
                  )
                }
              >
                ✖
              </Button>
            </li>
          ))}
        </ol>
        {weaponPool.length > LFG_WEAPON_POOL_MAX_LENGTH && (
          <div className="play-settings__error-text">
            You can have at most {LFG_WEAPON_POOL_MAX_LENGTH} weapons in your
            weapon pool
          </div>
        )}
        <div className="mt-6">
          <Button
            loading={transition.state === "submitting"}
            loadingText="Saving..."
            disabled={weaponPool.length > LFG_WEAPON_POOL_MAX_LENGTH}
          >
            Save
          </Button>
        </div>
      </Form>
    </div>
  );
}
