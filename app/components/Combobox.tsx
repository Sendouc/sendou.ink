import { Combobox as HeadlessCombobox } from "@headlessui/react";
import * as React from "react";
import Fuse from "fuse.js";
import clsx from "clsx";
import type { Unpacked } from "~/utils/types";
import { useFetcher } from "@remix-run/react";
import type { UsersLoaderData } from "~/routes/users";

const MAX_RESULTS_SHOWN = 6;

interface ComboBoxProps<T> {
  options: ({ label: string; value: string } & T)[];
  inputName: string;
  placeholder: string;
  isLoading?: boolean;
}

export function Combobox<T extends Record<string, string>>({
  options,
  inputName,
  placeholder,
  isLoading = false,
}: ComboBoxProps<T>) {
  const [selectedOption, setSelectedOption] =
    React.useState<Unpacked<typeof options>>();
  const [query, setQuery] = React.useState("");

  const filteredOptions = (() => {
    if (!query) return [];

    const fuse = new Fuse(options, {
      keys: [...Object.keys(options[0])],
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
      onChange={setSelectedOption}
      name={inputName}
      disabled={isLoading}
    >
      <HeadlessCombobox.Input
        onChange={(event) => setQuery(event.target.value)}
        placeholder={isLoading ? "Loading..." : placeholder}
        className="combobox-input"
        displayValue={(option) =>
          (option as Unpacked<typeof options>)?.label ?? ""
        }
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

export function UserCombobox<T>({
  inputName,
}: Pick<ComboBoxProps<T>, "inputName">) {
  const fetcher = useFetcher<UsersLoaderData>();

  React.useEffect(() => {
    if (fetcher.type === "init") fetcher.load("/users");
  }, [fetcher]);

  const isLoading = fetcher.type !== "done";

  return (
    <Combobox
      inputName={inputName}
      options={
        isLoading
          ? []
          : fetcher.data.users.map((u) => ({
              label: u.discordFullName,
              value: String(u.id),
              discordId: u.discordId,
            }))
      }
      placeholder="Sendou#0043"
      isLoading={isLoading}
    />
  );
}
