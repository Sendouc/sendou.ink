import {
  json,
  redirect,
  type LoaderArgs,
  type ActionFunction,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { AbilitiesSelector } from "~/components/AbilitiesSelector";
import { Button } from "~/components/Button";
import { GearCombobox, WeaponCombobox } from "~/components/Combobox";
import { Image } from "~/components/Image";
import { Label } from "~/components/Label";
import { Main } from "~/components/Main";
import { BUILD, EMPTY_BUILD } from "~/constants";
import { db } from "~/db";
import type { GearType } from "~/db/types";
import { requireUser } from "~/modules/auth";
import {
  clothesGearIds,
  headGearIds,
  modesShort,
  shoesGearIds,
  mainWeaponIds,
} from "~/modules/in-game-lists";
import type {
  BuildAbilitiesTuple,
  BuildAbilitiesTupleWithUnknown,
  MainWeaponId,
} from "~/modules/in-game-lists/types";
import { parseRequestFormData } from "~/utils/remix";
import { modeImageUrl, userBuildsPage } from "~/utils/urls";
import {
  actualNumber,
  checkboxValueToBoolean,
  clothesMainSlotAbility,
  falsyToNull,
  headMainSlotAbility,
  id,
  processMany,
  removeDuplicates,
  safeJSONParse,
  shoesMainSlotAbility,
  stackableAbility,
  toArray,
} from "~/utils/zod";

const newBuildActionSchema = z.object({
  buildToEditId: z.preprocess(actualNumber, id.nullish()),
  title: z.string().min(BUILD.TITLE_MIN_LENGTH).max(BUILD.TITLE_MAX_LENGTH),
  description: z.preprocess(
    falsyToNull,
    z.string().max(BUILD.DESCRIPTION_MAX_LENGTH).nullable()
  ),
  TW: z.preprocess(checkboxValueToBoolean, z.boolean()),
  SZ: z.preprocess(checkboxValueToBoolean, z.boolean()),
  TC: z.preprocess(checkboxValueToBoolean, z.boolean()),
  RM: z.preprocess(checkboxValueToBoolean, z.boolean()),
  CB: z.preprocess(checkboxValueToBoolean, z.boolean()),
  "weapon[value]": z.preprocess(
    processMany(toArray, removeDuplicates),
    z
      .array(
        z.preprocess(
          actualNumber,
          z
            .number()
            .refine((val) =>
              mainWeaponIds.includes(val as typeof mainWeaponIds[number])
            )
        )
      )
      .min(1)
      .max(BUILD.MAX_WEAPONS_COUNT)
  ),
  "HEAD[value]": z.preprocess(
    actualNumber,
    z
      .number()
      .refine((val) => headGearIds.includes(val as typeof headGearIds[number]))
  ),
  "CLOTHES[value]": z.preprocess(
    actualNumber,
    z
      .number()
      .refine((val) =>
        clothesGearIds.includes(val as typeof clothesGearIds[number])
      )
  ),
  "SHOES[value]": z.preprocess(
    actualNumber,
    z
      .number()
      .refine((val) =>
        shoesGearIds.includes(val as typeof shoesGearIds[number])
      )
  ),
  abilities: z.preprocess(
    safeJSONParse,
    z.tuple([
      z.tuple([
        headMainSlotAbility,
        stackableAbility,
        stackableAbility,
        stackableAbility,
      ]),
      z.tuple([
        clothesMainSlotAbility,
        stackableAbility,
        stackableAbility,
        stackableAbility,
      ]),
      z.tuple([
        shoesMainSlotAbility,
        stackableAbility,
        stackableAbility,
        stackableAbility,
      ]),
    ])
  ),
});

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  const data = await parseRequestFormData({
    request,
    schema: newBuildActionSchema,
  });

  const usersBuilds = db.builds.buildsByUserId(user.id);
  if (usersBuilds.length >= BUILD.MAX_COUNT) {
    throw new Response(null, { status: 400 });
  }

  const commonArgs = {
    title: data.title,
    description: data.description,
    abilities: data.abilities as BuildAbilitiesTuple,
    headGearSplId: data["HEAD[value]"],
    clothesGearSplId: data["CLOTHES[value]"],
    shoesGearSplId: data["SHOES[value]"],
    modes: modesShort.filter((mode) => data[mode]),
    weaponSplIds: data["weapon[value]"] as Array<MainWeaponId>,
    ownerId: user.id,
  };
  if (data.buildToEditId) {
    db.builds.updateByReplacing({ id: data.buildToEditId, ...commonArgs });
  } else {
    db.builds.create(commonArgs);
  }

  return redirect(userBuildsPage(user));
};

export const handle = {
  i18n: ["weapons", "builds", "gear"],
};

const newBuildLoaderParamsSchema = z.object({
  buildId: z.preprocess(actualNumber, id),
  userId: z.preprocess(actualNumber, id),
});

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUser(request);
  const url = new URL(request.url);

  const params = newBuildLoaderParamsSchema.safeParse(
    Object.fromEntries(url.searchParams)
  );

  if (!params.success || params.data.userId !== user.id)
    return json({ buildToEdit: null });

  const usersBuilds = db.builds.buildsByUserId(params.data.userId);
  const buildToEdit = usersBuilds.find((b) => b.id === params.data.buildId);

  return json({ buildToEdit });
};

export default function NewBuildPage() {
  const { buildToEdit } = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  return (
    <Main halfWidth>
      <Form className="stack md items-start" method="post">
        {buildToEdit && (
          <input type="hidden" name="buildToEditId" value={buildToEdit.id} />
        )}
        <WeaponsSelector />
        <GearSelector type="HEAD" />
        <GearSelector type="CLOTHES" />
        <GearSelector type="SHOES" />
        <Abilities />
        <TitleInput />
        <DescriptionTextarea />
        <ModeCheckboxes />
        <Button type="submit" className="mt-4" data-cy="submit-button">
          {t("actions.submit")}
        </Button>
      </Form>
    </Main>
  );
}

function TitleInput() {
  const { t } = useTranslation("builds");
  const { buildToEdit } = useLoaderData<typeof loader>();

  return (
    <div>
      <Label htmlFor="title" required>
        {t("forms.title")}
      </Label>
      <input
        name="title"
        required
        minLength={BUILD.TITLE_MIN_LENGTH}
        maxLength={BUILD.TITLE_MAX_LENGTH}
        defaultValue={buildToEdit?.title}
        data-cy="title-input"
      />
    </div>
  );
}

function DescriptionTextarea() {
  const { t } = useTranslation();
  const { buildToEdit } = useLoaderData<typeof loader>();
  const [value, setValue] = React.useState(buildToEdit?.description ?? "");

  return (
    <div>
      <Label
        htmlFor="description"
        valueLimits={{
          current: value.length,
          max: BUILD.DESCRIPTION_MAX_LENGTH,
        }}
      >
        {t("forms.description")}
      </Label>
      <textarea
        id="description"
        name="description"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={BUILD.DESCRIPTION_MAX_LENGTH}
        data-cy="description-textarea"
      />
    </div>
  );
}

function ModeCheckboxes() {
  const { buildToEdit } = useLoaderData<typeof loader>();
  const { t } = useTranslation("builds");

  return (
    <div>
      <Label>{t("forms.modes")}</Label>
      <div className="stack horizontal md">
        {modesShort.map((mode) => (
          <div key={mode} className="stack items-center">
            <label htmlFor={mode}>
              <Image alt="" path={modeImageUrl(mode)} width={24} height={24} />
            </label>
            <input
              id={mode}
              name={mode}
              type="checkbox"
              defaultChecked={buildToEdit?.modes?.includes(mode)}
              data-cy={`${mode}-checkbox`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function WeaponsSelector() {
  const { buildToEdit } = useLoaderData<typeof loader>();
  const { t } = useTranslation(["common", "weapons", "builds"]);
  const [count, setCount] = React.useState(buildToEdit?.weapons.length ?? 1);

  return (
    <div>
      <Label required htmlFor="weapon">
        {t("builds:forms.weapons")}
      </Label>
      <div className="stack sm">
        {new Array(count).fill(null).map((_, i) => {
          return (
            <div key={i} className="stack horizontal sm items-center">
              <div>
                <WeaponCombobox
                  inputName="weapon"
                  id="weapon"
                  required
                  initialWeaponId={buildToEdit?.weapons[i]}
                />
              </div>
              {i === count - 1 && (
                <>
                  <Button
                    tiny
                    disabled={count === BUILD.MAX_WEAPONS_COUNT}
                    onClick={() => setCount((count) => count + 1)}
                    data-cy="add-date-button"
                  >
                    {t("common:actions.add")}
                  </Button>
                  {count > 1 && (
                    <Button
                      tiny
                      onClick={() => setCount((count) => count - 1)}
                      data-cy="remove-date-button"
                      variant="destructive"
                    >
                      {t("common:actions.remove")}
                    </Button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GearSelector({ type }: { type: GearType }) {
  const { buildToEdit } = useLoaderData<typeof loader>();
  const { t } = useTranslation("builds");

  const initialGearId = !buildToEdit
    ? undefined
    : type === "HEAD"
    ? buildToEdit.headGearSplId
    : type === "CLOTHES"
    ? buildToEdit.clothesGearSplId
    : buildToEdit.shoesGearSplId;

  return (
    <div>
      <Label htmlFor={type} required>
        {t(`forms.gear.${type}`)}
      </Label>
      <div>
        <GearCombobox
          gearType={type}
          inputName={type}
          id={type}
          required
          initialGearId={initialGearId}
        />
      </div>
    </div>
  );
}

function Abilities() {
  const { buildToEdit } = useLoaderData<typeof loader>();
  const [abilities, setAbilities] =
    React.useState<BuildAbilitiesTupleWithUnknown>(
      buildToEdit?.abilities ?? EMPTY_BUILD
    );

  return (
    <div>
      <input
        className="hidden-input-with-validation"
        name="abilities"
        value={
          abilities.flat().every((a) => a !== "UNKNOWN")
            ? JSON.stringify(abilities)
            : []
        }
        // empty onChange is because otherwise it will give a React error in console
        // readOnly can't be set as then validation is not active
        onChange={() => null}
        required
      />
      <AbilitiesSelector
        selectedAbilities={abilities}
        onChange={setAbilities}
      />
    </div>
  );
}
