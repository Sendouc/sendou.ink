import { useTranslation } from "react-i18next";
import { Label } from "~/components/Label";
import { Main } from "~/components/Main";
import { BUILD } from "~/constants";
import * as React from "react";
import { Form } from "@remix-run/react";
import type { GearType } from "~/modules/in-game-lists";
import {
  clothesGearIds,
  headGearIds,
  shoesGearIds,
  weaponIds,
} from "~/modules/in-game-lists";
import { modesShort } from "~/modules/in-game-lists";
import { Image } from "~/components/Image";
import { modeImageUrl } from "~/utils/urls";
import { GearCombobox, WeaponCombobox } from "~/components/Combobox";
import { Button } from "~/components/Button";
import { AbilitiesSelector } from "~/components/AbilitiesSelector";
import { z } from "zod";
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
import type { ActionFunction } from "@remix-run/node";
import { requireUser } from "~/modules/auth";
import { parseRequestFormData } from "~/utils/remix";
import { db } from "~/db";
import type { BuildAbilitiesTupleWithUnknown } from "~/modules/in-game-lists/types";

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
              weaponIds.includes(val as typeof weaponIds[number])
            )
        )
      )
      .min(1)
      .max(BUILD.MAX_WEAPONS_COUNT)
  ),
  "head[value]": z.preprocess(
    actualNumber,
    z
      .number()
      .refine((val) => headGearIds.includes(val as typeof headGearIds[number]))
  ),
  "clothes[value]": z.preprocess(
    actualNumber,
    z
      .number()
      .refine((val) =>
        clothesGearIds.includes(val as typeof clothesGearIds[number])
      )
  ),
  "shoes[value]": z.preprocess(
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

  db.builds.create({
    title: data.title,
    description: data.description,
    abilities: [],
    headGearSplId: data["head[value]"],
    clothesGearSplId: data["clothes[value]"],
    shoesGearSplId: data["shoes[value]"],
    modes: modesShort.filter((mode) => data[mode]),
    weaponSplIds: data["weapon[value]"],
    ownerId: user.id,
  });

  return null;
};

export const handle = {
  i18n: ["weapons", "builds", "gear"],
};

export default function NewBuildPage() {
  const { t } = useTranslation();

  return (
    <Main halfWidth>
      <Form className="stack md items-start" method="post">
        <WeaponsSelector />
        <GearSelector type="head" />
        <GearSelector type="clothes" />
        <GearSelector type="shoes" />
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
  // const { eventToEdit } = useLoaderData<typeof loader>();

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
        // defaultValue={eventToEdit?.name}
        data-cy="title-input"
      />
    </div>
  );
}

function DescriptionTextarea() {
  const { t } = useTranslation();
  // const { eventToEdit } = useLoaderData<typeof loader>();
  // const [value, setValue] = React.useState(eventToEdit?.description ?? "");
  const [value, setValue] = React.useState("");

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
  const { t } = useTranslation("builds");

  return (
    <div>
      <Label>{t("forms.modes")}</Label>
      <div className="stack horizontal md">
        {modesShort.map((mode) => (
          <div key={mode} className="stack items-center">
            <label htmlFor={mode}>
              {/* xxx: fix alt */}
              <Image alt="" path={modeImageUrl(mode)} width={24} height={24} />
            </label>
            <input id={mode} name={mode} type="checkbox" />
          </div>
        ))}
      </div>
    </div>
  );
}

function WeaponsSelector() {
  const { t } = useTranslation(["common", "weapons", "builds"]);
  const [count, setCount] = React.useState(1);

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
                <WeaponCombobox inputName="weapon" id="weapon" required />
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

// xxx: could be wider not to have line breaks in long gear names
function GearSelector({ type }: { type: GearType }) {
  const { t } = useTranslation("builds");

  return (
    <div>
      <Label htmlFor={type} required>
        {t(`forms.gear.${type}`)}
      </Label>
      <div>
        <GearCombobox gearType={type} inputName={type} id={type} required />
      </div>
    </div>
  );
}

function Abilities() {
  const [abilities, setAbilities] =
    React.useState<BuildAbilitiesTupleWithUnknown>([
      ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
      ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
      ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
    ]);

  return (
    <div>
      <input type="hidden" name="abilities" value={JSON.stringify(abilities)} />
      <AbilitiesSelector
        selectedAbilities={abilities}
        onChange={setAbilities}
      />
    </div>
  );
}
