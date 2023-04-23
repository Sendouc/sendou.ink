import {
  json,
  redirect,
  type ActionFunction,
  type LoaderArgs,
} from "@remix-run/node";
import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import * as React from "react";
import { z } from "zod";
import { AbilitiesSelector } from "~/components/AbilitiesSelector";
import { Button } from "~/components/Button";
import { GearCombobox, WeaponCombobox } from "~/components/Combobox";
import { FormMessage } from "~/components/FormMessage";
import { CrossIcon } from "~/components/icons/Cross";
import { PlusIcon } from "~/components/icons/Plus";
import { Image } from "~/components/Image";
import { Label } from "~/components/Label";
import { RequiredHiddenInput } from "~/components/RequiredHiddenInput";
import { SubmitButton } from "~/components/SubmitButton";
import { BUILD } from "~/constants";
import { db } from "~/db";
import type { GearType } from "~/db/types";
import {
  validatedBuildFromSearchParams,
  validatedWeaponIdFromSearchParams,
} from "~/features/build-analyzer";
import { useTranslation } from "~/hooks/useTranslation";
import { requireUser } from "~/modules/auth";
import { requireUserId } from "~/modules/auth/user.server";
import {
  clothesGearIds,
  headGearIds,
  modesShort,
  shoesGearIds,
} from "~/modules/in-game-lists";
import { rankedModesShort } from "~/modules/in-game-lists/modes";
import type {
  BuildAbilitiesTuple,
  BuildAbilitiesTupleWithUnknown,
  MainWeaponId,
} from "~/modules/in-game-lists/types";
import { parseRequestFormData, type SendouRouteHandle } from "~/utils/remix";
import { modeImageUrl, userBuildsPage } from "~/utils/urls";
import {
  actualNumber,
  checkboxValueToBoolean,
  checkboxValueToDbBoolean,
  clothesMainSlotAbility,
  dbBoolean,
  falsyToNull,
  headMainSlotAbility,
  id,
  processMany,
  removeDuplicates,
  safeJSONParse,
  shoesMainSlotAbility,
  stackableAbility,
  toArray,
  weaponSplId,
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
  private: z.preprocess(checkboxValueToDbBoolean, dbBoolean),
  "weapon[value]": z.preprocess(
    processMany(toArray, removeDuplicates),
    z.array(weaponSplId).min(1).max(BUILD.MAX_WEAPONS_COUNT)
  ),
  "HEAD[value]": z.preprocess(
    actualNumber,
    z
      .number()
      .refine((val) =>
        headGearIds.includes(val as (typeof headGearIds)[number])
      )
  ),
  "CLOTHES[value]": z.preprocess(
    actualNumber,
    z
      .number()
      .refine((val) =>
        clothesGearIds.includes(val as (typeof clothesGearIds)[number])
      )
  ),
  "SHOES[value]": z.preprocess(
    actualNumber,
    z
      .number()
      .refine((val) =>
        shoesGearIds.includes(val as (typeof shoesGearIds)[number])
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

  const usersBuilds = db.builds.buildsByUserId({
    userId: user.id,
    loggedInUserId: user.id,
  });
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
    private: data.private,
  };
  if (data.buildToEditId) {
    db.builds.updateByReplacing({ id: data.buildToEditId, ...commonArgs });
  } else {
    db.builds.create(commonArgs);
  }

  return redirect(userBuildsPage(user));
};

export const handle: SendouRouteHandle = {
  i18n: ["weapons", "builds", "gear"],
};

const newBuildLoaderParamsSchema = z.object({
  buildId: z.preprocess(actualNumber, id),
  userId: z.preprocess(actualNumber, id),
});

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUserId(request);
  const url = new URL(request.url);

  const params = newBuildLoaderParamsSchema.safeParse(
    Object.fromEntries(url.searchParams)
  );

  if (!params.success || params.data.userId !== user.id) {
    return json({ buildToEdit: null });
  }

  const usersBuilds = db.builds.buildsByUserId({
    userId: params.data.userId,
    loggedInUserId: user.id,
  });
  const buildToEdit = usersBuilds.find((b) => b.id === params.data.buildId);

  return json({
    buildToEdit,
  });
};

export default function NewBuildPage() {
  const { buildToEdit } = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  return (
    <div className="half-width u__build-form">
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
        <PrivateCheckbox />
        <SubmitButton className="mt-4">{t("actions.submit")}</SubmitButton>
      </Form>
    </div>
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
        id="title"
        name="title"
        required
        minLength={BUILD.TITLE_MIN_LENGTH}
        maxLength={BUILD.TITLE_MAX_LENGTH}
        defaultValue={buildToEdit?.title}
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
      />
    </div>
  );
}

function ModeCheckboxes() {
  const { buildToEdit } = useLoaderData<typeof loader>();
  const { t } = useTranslation("builds");

  const modes = buildToEdit?.modes ?? rankedModesShort;

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
              defaultChecked={modes.includes(mode)}
              data-testid={`${mode}-checkbox`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function PrivateCheckbox() {
  const { buildToEdit } = useLoaderData<typeof loader>();
  const { t } = useTranslation(["builds", "common"]);

  return (
    <div>
      <Label htmlFor="private">{t("common:build.private")}</Label>
      <input
        id="private"
        name="private"
        type="checkbox"
        defaultChecked={Boolean(buildToEdit?.private)}
      />
      <FormMessage type="info" className="mt-0">
        {t("builds:forms.private.info")}
      </FormMessage>
    </div>
  );
}

function WeaponsSelector() {
  const [searchParams] = useSearchParams();
  const { buildToEdit } = useLoaderData<typeof loader>();
  const { t } = useTranslation(["common", "weapons", "builds"]);
  const [weapons, setWeapons] = React.useState(
    buildToEdit?.weapons.map((wpn) => wpn.weaponSplId) ?? [
      validatedWeaponIdFromSearchParams(searchParams),
    ]
  );

  return (
    <div>
      <Label required htmlFor="weapon">
        {t("builds:forms.weapons")}
      </Label>
      <div className="stack sm">
        {weapons.map((weapon, i) => {
          return (
            <div key={i} className="stack horizontal sm items-center">
              <div>
                <WeaponCombobox
                  inputName="weapon"
                  id="weapon"
                  className="u__build-form__weapon"
                  required
                  onChange={(opt) =>
                    opt &&
                    setWeapons((weapons) => {
                      const newWeapons = [...weapons];
                      newWeapons[i] = Number(opt.value) as MainWeaponId;
                      return newWeapons;
                    })
                  }
                  initialWeaponId={weapon ?? undefined}
                />
              </div>
              {i === weapons.length - 1 && (
                <>
                  <Button
                    size="tiny"
                    disabled={weapons.length === BUILD.MAX_WEAPONS_COUNT}
                    onClick={() => setWeapons((weapons) => [...weapons, 0])}
                    icon={<PlusIcon />}
                    testId="add-weapon-button"
                  />
                  {weapons.length > 1 && (
                    <Button
                      size="tiny"
                      onClick={() =>
                        setWeapons((weapons) => {
                          const newWeapons = [...weapons];
                          newWeapons.pop();
                          return newWeapons;
                        })
                      }
                      variant="destructive"
                      icon={<CrossIcon />}
                    />
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
  const [searchParams] = useSearchParams();
  const { buildToEdit } = useLoaderData<typeof loader>();
  const [abilities, setAbilities] =
    React.useState<BuildAbilitiesTupleWithUnknown>(
      buildToEdit?.abilities ?? validatedBuildFromSearchParams(searchParams)
    );

  return (
    <div>
      <RequiredHiddenInput
        value={JSON.stringify(abilities)}
        isValid={abilities.flat().every((a) => a !== "UNKNOWN")}
        name="abilities"
      />
      <AbilitiesSelector
        selectedAbilities={abilities}
        onChange={setAbilities}
      />
    </div>
  );
}
