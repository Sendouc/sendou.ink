import { Combobox as HeadlessCombobox } from "@headlessui/react";
import clsx from "clsx";
import Fuse from "fuse.js";
import * as React from "react";
import type { GearType, UserWithPlusTier } from "~/db/types";
import { useAllEventsWithMapPools, useUsers } from "~/hooks/swr";
import { useTranslation } from "~/hooks/useTranslation";
import type { MainWeaponId } from "~/modules/in-game-lists";
import {
  clothesGearIds,
  headGearIds,
  mainWeaponIds,
  shoesGearIds,
  subWeaponIds,
  weaponCategories,
} from "~/modules/in-game-lists";
import { nonBombSubWeaponIds } from "~/modules/in-game-lists/weapon-ids";
import { type SerializedMapPoolEvent } from "~/routes/calendar/map-pool-events";
import type { Unpacked } from "~/utils/types";
import {
  gearImageUrl,
  mainWeaponImageUrl,
  subWeaponImageUrl,
} from "~/utils/urls";
import { Image } from "./Image";

const MAX_RESULTS_SHOWN = 6;

interface ComboboxBaseOption {
  label: string;
  value: string;
  imgPath?: string;
}

type ComboboxOption<T> = ComboboxBaseOption & T;
interface ComboboxProps<T> {
  options: ComboboxOption<T>[];
  inputName: string;
  placeholder: string;
  className?: string;
  id?: string;
  isLoading?: boolean;
  required?: boolean;
  initialValue: ComboboxOption<T> | null;
  onChange?: (selectedOption: ComboboxOption<T> | null) => void;
  fullWidth?: boolean;
  nullable?: true;
  fuseOptions?: Fuse.IFuseOptions<ComboboxOption<T>>;
}

export function Combobox<T extends Record<string, string | null | number>>({
  options,
  inputName,
  placeholder,
  initialValue,
  onChange,
  required,
  className,
  id,
  nullable,
  isLoading = false,
  fullWidth = false,
  fuseOptions = {},
}: ComboboxProps<T>) {
  const { t } = useTranslation();

  const [selectedOption, setSelectedOption] = React.useState<Unpacked<
    typeof options
  > | null>(initialValue);
  const [query, setQuery] = React.useState("");

  const filteredOptions = (() => {
    if (!query) return [];

    const fuse = new Fuse(options, {
      ...fuseOptions,
      keys: [...Object.keys(options[0] ?? {})],
    });

    return fuse
      .search(query)
      .slice(0, MAX_RESULTS_SHOWN)
      .map((res) => res.item);
  })();

  const noMatches = filteredOptions.length === 0;

  const displayValue = (option: Unpacked<typeof options>) => {
    return option?.label ?? "";
  };

  return (
    <div className="combobox-wrapper">
      <HeadlessCombobox
        value={selectedOption}
        onChange={(selected) => {
          onChange?.(selected);
          setSelectedOption(selected);
        }}
        name={inputName}
        disabled={!selectedOption && isLoading}
        // TODO: remove hack that prevents TS from freaking out. probably related: https://github.com/tailwindlabs/headlessui/issues/1895
        nullable={nullable as true}
      >
        <HeadlessCombobox.Input
          onChange={(event) => setQuery(event.target.value)}
          placeholder={isLoading ? t("actions.loading") : placeholder}
          className={clsx("combobox-input", className, {
            fullWidth,
          })}
          defaultValue={initialValue}
          displayValue={displayValue}
          data-testid={`${inputName}-combobox-input`}
          id={id}
          required={required}
        />
        <HeadlessCombobox.Options
          className={clsx("combobox-options", {
            empty: noMatches,
            fullWidth,
            hidden: !query,
          })}
        >
          {isLoading ? (
            <div className="combobox-no-matches">{t("actions.loading")}</div>
          ) : noMatches ? (
            <div className="combobox-no-matches">
              {t("forms.errors.noSearchMatches")}{" "}
              <span className="combobox-emoji">🤔</span>
            </div>
          ) : (
            filteredOptions.map((option) => (
              <HeadlessCombobox.Option
                key={option.value}
                value={option}
                as={React.Fragment}
              >
                {({ active }) => (
                  <li className={clsx("combobox-item", { active })}>
                    {option.imgPath && (
                      <Image
                        alt=""
                        path={option.imgPath}
                        width={24}
                        height={24}
                      />
                    )}
                    {option.label}
                  </li>
                )}
              </HeadlessCombobox.Option>
            ))
          )}
        </HeadlessCombobox.Options>
      </HeadlessCombobox>
    </div>
  );
}

// Reference for Fuse options: https://fusejs.io/api/options.html
const USER_COMBOBOX_FUSE_OPTIONS = {
  threshold: 0.42, // Empirically determined value to get an exact match for a Discord ID
};

export function UserCombobox({
  inputName,
  initialUserId,
  onChange,
  userIdsToOmit,
  className,
  required,
  id,
}: Pick<
  ComboboxProps<Pick<UserWithPlusTier, "discordId" | "plusTier">>,
  "inputName" | "onChange" | "className" | "id" | "required"
> & { userIdsToOmit?: Set<number>; initialUserId?: number }) {
  const { t } = useTranslation();
  const { users, isLoading, isError } = useUsers();

  const options = React.useMemo(() => {
    if (!users) return [];

    const data = userIdsToOmit
      ? users.filter((user) => !userIdsToOmit.has(user.id))
      : users;

    return data.map((u) => ({
      label: u.discordFullName,
      value: String(u.id),
      discordId: u.discordId,
      plusTier: u.plusTier,
    }));
  }, [users, userIdsToOmit]);

  const initialValue = React.useMemo(() => {
    if (!initialUserId) return;
    return options.find((o) => o.value === String(initialUserId));
  }, [options, initialUserId]);

  if (isError) {
    return (
      <div className="text-sm text-error">{t("errors.genericReload")}</div>
    );
  }

  return (
    <Combobox
      inputName={inputName}
      options={options}
      placeholder="Sendou#4059"
      isLoading={isLoading}
      initialValue={initialValue ?? null}
      onChange={onChange}
      className={className}
      id={id}
      required={required}
      fuseOptions={USER_COMBOBOX_FUSE_OPTIONS}
      // reload after users have loaded
      key={String(!!initialValue)}
    />
  );
}

export function WeaponCombobox({
  id,
  required,
  className,
  inputName,
  onChange,
  initialWeaponId,
  weaponIdsToOmit,
  fullWidth,
  nullable,
}: Pick<
  ComboboxProps<ComboboxBaseOption>,
  | "inputName"
  | "onChange"
  | "className"
  | "id"
  | "required"
  | "fullWidth"
  | "nullable"
> & {
  initialWeaponId?: (typeof mainWeaponIds)[number];
  weaponIdsToOmit?: Set<MainWeaponId>;
}) {
  const { t } = useTranslation("weapons");

  const idToWeapon = (id: (typeof mainWeaponIds)[number]) => ({
    value: String(id),
    label: t(`MAIN_${id}`),
    imgPath: mainWeaponImageUrl(id),
  });

  return (
    <Combobox
      inputName={inputName}
      options={mainWeaponIds
        .filter((id) => !weaponIdsToOmit?.has(id))
        .map(idToWeapon)}
      initialValue={
        typeof initialWeaponId === "number" ? idToWeapon(initialWeaponId) : null
      }
      placeholder={t(`MAIN_${weaponCategories[0].weaponIds[0]}`)}
      onChange={onChange}
      className={className}
      id={id}
      required={required}
      fullWidth={fullWidth}
      nullable={nullable}
    />
  );
}

export function AllWeaponCombobox({
  id,
  inputName,
  onChange,
  fullWidth,
}: Pick<
  ComboboxProps<ComboboxBaseOption>,
  "inputName" | "onChange" | "id" | "fullWidth"
>) {
  const { t } = useTranslation("weapons");

  const options = () => {
    const result: ComboboxProps<
      Record<string, string | null | number>
    >["options"] = [];

    for (const mainWeaponId of mainWeaponIds) {
      result.push({
        value: `MAIN_${mainWeaponId}`,
        label: t(`MAIN_${mainWeaponId}`),
        imgPath: mainWeaponImageUrl(mainWeaponId),
      });
    }

    for (const subWeaponId of subWeaponIds) {
      if (nonBombSubWeaponIds.includes(subWeaponId)) continue;

      result.push({
        value: `SUB_${subWeaponId}`,
        label: t(`SUB_${subWeaponId}`),
        imgPath: subWeaponImageUrl(subWeaponId),
      });
    }

    return result;
  };

  return (
    <Combobox
      inputName={inputName}
      options={options()}
      initialValue={null}
      placeholder={t(`MAIN_${weaponCategories[0].weaponIds[0]}`)}
      onChange={onChange}
      id={id}
      fullWidth={fullWidth}
    />
  );
}

export function GearCombobox({
  id,
  required,
  className,
  inputName,
  onChange,
  gearType,
  initialGearId,
}: Pick<
  ComboboxProps<ComboboxBaseOption>,
  "inputName" | "onChange" | "className" | "id" | "required"
> & { gearType: GearType; initialGearId?: number }) {
  const { t } = useTranslation("gear");

  const translationPrefix =
    gearType === "HEAD" ? "H" : gearType === "CLOTHES" ? "C" : "S";
  const ids =
    gearType === "HEAD"
      ? headGearIds
      : gearType === "CLOTHES"
      ? clothesGearIds
      : shoesGearIds;

  const idToGear = (id: (typeof ids)[number]) => ({
    value: String(id),
    label: t(`${translationPrefix}_${id}` as any),
    imgPath: gearImageUrl(gearType, id),
  });

  return (
    <Combobox
      inputName={inputName}
      options={ids.map(idToGear)}
      placeholder={idToGear(ids[0]).label}
      initialValue={initialGearId ? idToGear(initialGearId as any) : null}
      onChange={onChange}
      className={className}
      id={id}
      required={required}
    />
  );
}

const mapPoolEventToOption = (
  e: SerializedMapPoolEvent
): ComboboxOption<Pick<SerializedMapPoolEvent, "serializedMapPool">> => ({
  serializedMapPool: e.serializedMapPool,
  label: e.name,
  value: e.id.toString(),
});

type MapPoolEventsComboboxProps = Pick<
  ComboboxProps<Pick<SerializedMapPoolEvent, "serializedMapPool">>,
  "inputName" | "className" | "id" | "required"
> & {
  initialEvent?: SerializedMapPoolEvent;
  onChange: (event: SerializedMapPoolEvent | null) => void;
};

export function MapPoolEventsCombobox({
  id,
  required,
  className,
  inputName,
  onChange,
  initialEvent,
}: MapPoolEventsComboboxProps) {
  const { t } = useTranslation();
  const { events, isLoading, isError } = useAllEventsWithMapPools();

  const options = React.useMemo(
    () => (events ? events.map(mapPoolEventToOption) : []),
    [events]
  );

  // this is important so that we don't trigger the reset to the initialEvent every time
  const initialOption = React.useMemo(
    () => initialEvent && mapPoolEventToOption(initialEvent),
    [initialEvent]
  );

  if (isError) {
    return (
      <div className="text-sm text-error">{t("errors.genericReload")}</div>
    );
  }

  return (
    <Combobox
      inputName={inputName}
      options={isLoading && initialOption ? [initialOption] : options}
      placeholder={t("actions.search")}
      initialValue={initialOption ?? null}
      onChange={(e) => {
        onChange(
          e && {
            id: parseInt(e.value, 10),
            name: e.label,
            serializedMapPool: e.serializedMapPool,
          }
        );
      }}
      className={className}
      id={id}
      required={required}
      isLoading={isLoading}
      fullWidth
    />
  );
}
