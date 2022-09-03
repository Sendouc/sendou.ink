import { useTranslation } from "react-i18next";
import { Label } from "~/components/Label";
import { Main } from "~/components/Main";
import { BUILD } from "~/constants";
import * as React from "react";
import { Form } from "@remix-run/react";
import type { GearType } from "~/modules/in-game-lists";
import { modesShort } from "~/modules/in-game-lists";
import { Image } from "~/components/Image";
import { modeImageUrl } from "~/utils/urls";
import { GearCombobox, WeaponCombobox } from "~/components/Combobox";
import { Button } from "~/components/Button";

export const handle = {
  i18n: ["weapons", "builds", "gear"],
};

export default function NewBuildPage() {
  return (
    <Main halfWidth>
      <Form className="stack md items-start" method="post">
        <TitleInput />
        <DescriptionTextarea />
        <ModeCheckboxes />
        <WeaponsSelector />
        <GearSelector type="head" />
        <GearSelector type="clothes" />
        <GearSelector type="shoes" />
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
      <Label htmlFor="mode">{t("forms.modes")}</Label>
      <div className="stack horizontal md">
        {modesShort.map((mode) => (
          <div key={mode} className="stack items-center">
            <label htmlFor={mode}>
              {/* xxx: fix alt */}
              <Image alt="" path={modeImageUrl(mode)} width={24} height={24} />
            </label>
            <input id={mode} type="checkbox" />
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
                <WeaponCombobox inputName="weapon" id="weapon" />
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
