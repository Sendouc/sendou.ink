import { Combobox as HeadlessCombobox } from "@headlessui/react";
import * as React from "react";
import Fuse from "fuse.js";
import clsx from "clsx";
import type { Unpacked } from "~/utils/types";
import type { CalendarEvent, GearType, UserWithPlusTier } from "~/db/types";
import { useUsers } from "~/hooks/swr";
import { useTranslation } from "react-i18next";
import {
  clothesGearIds,
  headGearIds,
  shoesGearIds,
  mainWeaponIds,
  weaponCategories,
} from "~/modules/in-game-lists";
import { gearImageUrl, mainWeaponImageUrl } from "~/utils/urls";
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
  initialValue?: ComboboxOption<T>;
  clearsInputOnFocus?: boolean;
  onChange?: (selectedOption?: ComboboxOption<T>) => void;
  showEmptyQueryResults?: boolean;
}

export function Combobox<T extends Record<string, string | null | number>>({
  options,
  inputName,
  placeholder,
  initialValue,
  clearsInputOnFocus = false,
  onChange,
  required,
  className,
  id,
  isLoading = false,
  showEmptyQueryResults = false,
}: ComboboxProps<T>) {
  const [selectedOption, setSelectedOption] =
    React.useState<Unpacked<typeof options>>();
  const [lastSelectedOption, setLastSelectedOption] =
    React.useState<Unpacked<typeof options>>();
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    setSelectedOption(initialValue);
    setLastSelectedOption(initialValue);
  }, [initialValue]);

  const filteredOptions = (() => {
    if (!query) {
      if (showEmptyQueryResults) {
        return options.slice(0, MAX_RESULTS_SHOWN);
      }
      return [];
    }

    const fuse = new Fuse(options, {
      keys: [...Object.keys(options[0] ?? {})],
    });
    return fuse
      .search(query)
      .slice(0, MAX_RESULTS_SHOWN)
      .map((res) => res.item);
  })();

  const noMatches = filteredOptions.length === 0;

  return (
    <HeadlessCombobox
      value={selectedOption}
      onChange={(selected) => {
        onChange?.(selected ?? undefined);
        setSelectedOption(selected ?? undefined);
        setLastSelectedOption(selected ?? undefined);
      }}
      name={inputName}
      disabled={isLoading}
      nullable
    >
      <HeadlessCombobox.Input
        onFocus={() => {
          if (clearsInputOnFocus) {
            setSelectedOption(undefined);
          }
        }}
        onBlur={() => {
          if (!selectedOption && clearsInputOnFocus) {
            setSelectedOption(lastSelectedOption);
          }
        }}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={isLoading ? "Loading..." : placeholder}
        className={clsx("combobox-input", className)}
        displayValue={(option) =>
          (option as unknown as Unpacked<typeof options>)?.label ?? ""
        }
        data-cy={`${inputName}-combobox-input`}
        id={id}
        required={required}
      />
      <HeadlessCombobox.Options
        className={clsx("combobox-options", {
          empty: noMatches,
          hidden: !query && !showEmptyQueryResults,
        })}
      >
        {noMatches ? (
          <div className="combobox-no-matches">
            No matches found <span className="combobox-emoji">🤔</span>
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
  );
}

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
      <div className="text-sm text-error">
        Something went wrong. Try reloading the page.
      </div>
    );
  }

  return (
    <Combobox
      inputName={inputName}
      options={options}
      placeholder="Sendou#0043"
      isLoading={isLoading}
      initialValue={initialValue}
      onChange={onChange}
      className={className}
      id={id}
      required={required}
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
  clearsInputOnFocus,
}: Pick<
  ComboboxProps<ComboboxBaseOption>,
  | "inputName"
  | "onChange"
  | "className"
  | "id"
  | "required"
  | "clearsInputOnFocus"
> & { initialWeaponId?: typeof mainWeaponIds[number] }) {
  const { t } = useTranslation("weapons");

  const idToWeapon = (id: typeof mainWeaponIds[number]) => ({
    value: String(id),
    label: t(`MAIN_${id}`),
    imgPath: mainWeaponImageUrl(id),
  });

  return (
    <Combobox
      inputName={inputName}
      options={mainWeaponIds.map(idToWeapon)}
      initialValue={
        typeof initialWeaponId === "number"
          ? idToWeapon(initialWeaponId)
          : undefined
      }
      placeholder={t(`MAIN_${weaponCategories[0].weaponIds[0]}`)}
      onChange={onChange}
      className={className}
      id={id}
      required={required}
      clearsInputOnFocus={clearsInputOnFocus}
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

  const idToGear = (id: typeof ids[number]) => ({
    value: String(id),
    label: t(`${translationPrefix}_${id}` as any),
    imgPath: gearImageUrl(gearType, id),
  });

  return (
    <Combobox
      inputName={inputName}
      options={ids.map(idToGear)}
      placeholder={idToGear(ids[0]).label}
      initialValue={initialGearId ? idToGear(initialGearId as any) : undefined}
      onChange={onChange}
      className={className}
      id={id}
      required={required}
    />
  );
}

export function EventCombobox({
  id,
  required,
  className,
  inputName,
  events,
  onChange,
}: Pick<
  ComboboxProps<ComboboxBaseOption>,
  "inputName" | "className" | "id" | "required" | "onChange"
> & {
  events: Pick<CalendarEvent, "id" | "name">[];
}) {
  const { t } = useTranslation();

  const options = React.useMemo(
    () =>
      events.map((event) => ({
        label: event.name,
        value: event.id.toString(),
      })),
    [events]
  );

  return (
    <Combobox
      inputName={inputName}
      options={options}
      placeholder={t("forms.name")}
      onChange={onChange}
      className={className}
      id={id}
      required={required}
      showEmptyQueryResults
      clearsInputOnFocus
    />
  );
}
