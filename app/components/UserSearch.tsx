import { Combobox } from "@headlessui/react";
import { useFetcher } from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";
import { useDebounce } from "react-use";
import type { User } from "~/db/types";

const people = [
  "Durward Reynolds",
  "Kenton Towne",
  "Therese Wunsch",
  "Benedict Kessler",
  "Katelyn Rohan",
];

// xxx: add call to search for users by the query
// xxx: add call to resolve user by id
export function UserSearch({
  inputName,
  onChange,
  initialUserId,
}: {
  inputName: string;
  onChange: (userId: User["id"]) => void;
  initialUserId?: number;
}) {
  const [selectedPerson, setSelectedPerson] = React.useState(people[0]);
  const fetcher = useFetcher();
  const [query, setQuery] = React.useState("");
  useDebounce(
    () => {
      if (!query) return;

      fetcher.load(`/u?q=${query}`);
    },
    1500,
    [query]
  );

  console.log(fetcher.data);

  const filteredPeople =
    query === ""
      ? people
      : people.filter((person) => {
          return person.toLowerCase().includes(query.toLowerCase());
        });

  const noMatches = false;

  return (
    <div className="combobox-wrapper">
      <Combobox
        value={selectedPerson}
        onChange={(value) => {
          console.log("onChange", value);
          onChange(1);
        }}
      >
        <Combobox.Input
          onChange={(event) => setQuery(event.target.value)}
          name={inputName}
          className="combobox-input"
          data-1p-ignore
        />
        <Combobox.Options
          className={clsx("combobox-options", {
            empty: noMatches,
            hidden: !query,
          })}
        >
          {filteredPeople.map((person) => (
            <Combobox.Option key={person} value={person} as={React.Fragment}>
              {({ active }) => (
                <li className={clsx("combobox-item", { active })}>{person}</li>
              )}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox>
    </div>
  );
}
