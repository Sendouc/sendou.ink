import { Combobox as HeadlessCombobox } from "@headlessui/react";
import * as React from "react";
import Fuse from "fuse.js";
import clsx from "clsx";
import type { Unpacked } from "~/utils/types";
import { useFetcher } from "@remix-run/react";
import type { UsersLoaderData } from "~/routes/users";
import type { UserWithPlusTier } from "~/db/types";

const MAX_RESULTS_SHOWN = 6;

type ComboboxOption<T> = { label: string; value: string } & T;
interface ComboboxProps<T> {
  options: ComboboxOption<T>[];
  inputName: string;
  placeholder: string;
  className?: string;
  id?: string;
  isLoading?: boolean;
  initialValue?: ComboboxOption<T>;
  onChange?: (selectedOption?: ComboboxOption<T>) => void;
}

export function Combobox<T extends Record<string, string | null | number>>({
  options,
  inputName,
  placeholder,
  initialValue,
  onChange,
  className,
  id,
  isLoading = false,
}: ComboboxProps<T>) {
  const [selectedOption, setSelectedOption] =
    React.useState<Unpacked<typeof options>>();
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    setSelectedOption(initialValue);
  }, [initialValue]);

  const filteredOptions = (() => {
    if (!query) return [];

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
        onChange?.(selected);
        setSelectedOption(selected);
      }}
      name={inputName}
      disabled={isLoading}
    >
      <HeadlessCombobox.Input
        onChange={(event) => setQuery(event.target.value)}
        placeholder={isLoading ? "Loading..." : placeholder}
        className={clsx("combobox-input", className)}
        displayValue={(option) =>
          (option as Unpacked<typeof options>)?.label ?? ""
        }
        data-cy={`${inputName}-combobox-input`}
        id={id}
      />
      <HeadlessCombobox.Options
        className={clsx("combobox-options", {
          empty: noMatches,
          hidden: !query,
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

// TODO: if we search with only discord id "79237403620945920" then doesn't really make sense to do fuzzy search
export function UserCombobox({
  inputName,
  initialUserId,
  onChange,
  userIdsToOmit,
  className,
  id,
}: Pick<
  ComboboxProps<Pick<UserWithPlusTier, "discordId" | "plusTier">>,
  "inputName" | "onChange" | "className" | "id"
> & { userIdsToOmit?: Set<number>; initialUserId?: number }) {
  const fetcher = useFetcher<UsersLoaderData>();

  React.useEffect(() => {
    if (fetcher.type === "init") fetcher.load("/users");
  }, [fetcher]);

  const options = React.useMemo(() => {
    if (fetcher.type !== "done") return [];

    const data = userIdsToOmit
      ? fetcher.data.users.filter((user) => !userIdsToOmit.has(user.id))
      : fetcher.data.users;

    return data.map((u) => ({
      label: u.discordFullName,
      value: String(u.id),
      discordId: u.discordId,
      plusTier: u.plusTier,
    }));
  }, [fetcher, userIdsToOmit]);

  const initialValue = React.useMemo(() => {
    if (!initialUserId) return;
    return options.find((o) => o.value === String(initialUserId));
  }, [options, initialUserId]);

  return (
    <Combobox
      inputName={inputName}
      options={options}
      placeholder="Sendou#0043"
      isLoading={fetcher.type !== "done"}
      initialValue={initialValue}
      onChange={onChange}
      className={className}
      id={id}
    />
  );
}
