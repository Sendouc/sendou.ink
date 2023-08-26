import { Combobox } from "@headlessui/react";
import { useFetcher } from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";
import { useDebounce } from "react-use";
import type { User } from "~/db/types";
import type { UserSearchLoaderData } from "~/routes/u";
import { Avatar } from "./Avatar";
import { useTranslation } from "~/hooks/useTranslation";

type UserSearchUserItem = NonNullable<UserSearchLoaderData>["users"][number];

// xxx: add call to search for users by the query
// xxx: add call to resolve user by id
export function UserSearch({
  inputName,
  onChange,
  initialUserId,
  placeholder,
}: {
  inputName: string;
  onChange: (userId: User["id"]) => void;
  initialUserId?: number;
  placeholder?: string;
}) {
  const { t } = useTranslation();
  const [selectedUser, setSelectedUser] =
    React.useState<UserSearchUserItem | null>(null);
  const fetcher = useFetcher<UserSearchLoaderData>();
  const [query, setQuery] = React.useState("");
  useDebounce(
    () => {
      if (!query) return;

      fetcher.load(`/u?q=${query}&limit=6`);
    },
    1500,
    [query]
  );

  const noMatches = fetcher.data && fetcher.data.users.length === 0;
  const users = fetcher.data?.users ?? [];
  const initialSelectionIsLoading = false;

  return (
    <div className="combobox-wrapper">
      <Combobox
        value={selectedUser}
        onChange={(newUser) => {
          setSelectedUser(newUser);
          onChange(newUser!.id);
        }}
        disabled={initialSelectionIsLoading}
      >
        <Combobox.Input
          placeholder={
            initialSelectionIsLoading ? t("actions.loading") : placeholder
          }
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(user: UserSearchUserItem) => user?.discordName ?? ""}
          name={inputName}
          className="combobox-input"
          data-1p-ignore
          data-testid={`${inputName}-combobox-input`}
        />
        <Combobox.Options
          className={clsx("combobox-options", {
            empty: noMatches,
            hidden: !fetcher.data,
          })}
        >
          {noMatches ? (
            <div className="combobox-no-matches">
              {t("forms.errors.noSearchMatches")}{" "}
              <span className="combobox-emoji">🤔</span>
            </div>
          ) : null}
          {users.map((user) => (
            <Combobox.Option key={user.id} value={user} as={React.Fragment}>
              {({ active }) => (
                <li className={clsx("combobox-item", { active })}>
                  <Avatar user={user} size="xs" />
                  <div>
                    <div className="stack xs horizontal items-center">
                      <span className="combobox-username">
                        {user.discordName}
                      </span>{" "}
                      {user.plusTier ? (
                        <span className="text-xxs">+{user.plusTier}</span>
                      ) : null}
                    </div>
                    {user.discordUniqueName ? (
                      <div className="text-xs">{user.discordUniqueName}</div>
                    ) : null}
                  </div>
                </li>
              )}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox>
    </div>
  );
}
