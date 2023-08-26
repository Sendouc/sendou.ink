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

export function UserSearch({
  inputName,
  onChange,
  initialUserId,
  id,
}: {
  inputName: string;
  onChange?: (userId: User["id"]) => void;
  initialUserId?: number;
  id?: string;
}) {
  const { t } = useTranslation();
  const [selectedUser, setSelectedUser] =
    React.useState<UserSearchUserItem | null>(null);
  const queryFetcher = useFetcher<UserSearchLoaderData>();
  const initialUserFetcher = useFetcher<UserSearchLoaderData>();
  const [query, setQuery] = React.useState("");
  useDebounce(
    () => {
      if (!query) return;

      queryFetcher.load(`/u?q=${query}&limit=6`);
    },
    1000,
    [query]
  );

  // load initial user
  React.useEffect(() => {
    if (
      !initialUserId ||
      initialUserFetcher.state !== "idle" ||
      initialUserFetcher.data
    ) {
      return;
    }

    initialUserFetcher.load(`/u?q=${initialUserId}`);
  }, [initialUserId, initialUserFetcher]);
  React.useEffect(() => {
    if (!initialUserFetcher.data) return;

    setSelectedUser(initialUserFetcher.data.users[0]);
  }, [initialUserFetcher.data]);

  const noMatches = queryFetcher.data && queryFetcher.data.users.length === 0;
  const users = queryFetcher.data?.users ?? [];
  const initialSelectionIsLoading = Boolean(
    initialUserId && !initialUserFetcher.data
  );

  return (
    <div className="combobox-wrapper">
      {selectedUser && inputName ? (
        <input type="hidden" name={inputName} value={selectedUser.id} />
      ) : null}
      <Combobox
        value={selectedUser}
        onChange={(newUser) => {
          setSelectedUser(newUser);
          onChange?.(newUser!.id);
        }}
        disabled={initialSelectionIsLoading}
      >
        <Combobox.Input
          placeholder={
            initialSelectionIsLoading
              ? t("actions.loading")
              : "Search via name or ID..."
          }
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(user: UserSearchUserItem) => user?.discordName ?? ""}
          className="combobox-input"
          data-1p-ignore
          data-testid={`${inputName}-combobox-input`}
          id={id}
        />
        <Combobox.Options
          className={clsx("combobox-options", {
            empty: noMatches,
            hidden: !queryFetcher.data,
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
