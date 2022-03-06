import { Combobox as HeadlessCombobox } from "@headlessui/react";
import * as React from "react";
import Fuse from "fuse.js";
import clsx from "clsx";

const MAX_RESULTS_SHOWN = 6;

export function Combobox({
  options,
  onChange,
  inputName,
  placeholder,
}: {
  options: string[] | readonly string[];
  onChange: (value: string) => void;
  inputName: string;
  placeholder: string;
}) {
  const [query, setQuery] = React.useState("");

  const filteredOptions = (() => {
    if (!query) return [];

    const fuse = new Fuse(options);
    return fuse
      .search(query)
      .slice(0, MAX_RESULTS_SHOWN)
      .map((res) => res.item);
  })();

  return (
    <HeadlessCombobox value="" onChange={onChange}>
      <HeadlessCombobox.Input
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="combobox-input"
        name={inputName}
      />
      <HeadlessCombobox.Options
        className={clsx("combobox-options", {
          invisible: filteredOptions.length === 0,
        })}
      >
        {filteredOptions.map((option) => (
          <HeadlessCombobox.Option
            key={option}
            value={option}
            as={React.Fragment}
          >
            {({ active }) => (
              <li className={clsx("combobox-item", { active })}>{option}</li>
            )}
          </HeadlessCombobox.Option>
        ))}
      </HeadlessCombobox.Options>
    </HeadlessCombobox>
  );
}
