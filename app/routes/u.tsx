import type { LinksFunction, LoaderArgs, SerializeFrom } from "@remix-run/node";
import { Main } from "~/components/Main";
import { parseSearchParams, type SendouRouteHandle } from "~/utils/remix";
import { navIconUrl, userPage, USER_SEARCH_PAGE } from "~/utils/urls";
import styles from "~/styles/u.css";
import { Input } from "~/components/Input";
import { SearchIcon } from "~/components/icons/Search";
import { db } from "~/db";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { useDebounce } from "react-use";
import * as React from "react";
import { Avatar } from "~/components/Avatar";
import { discordFullName } from "~/utils/strings";
import { useTranslation } from "~/hooks/useTranslation";
import { z } from "zod";
import { queryToUserIdentifier } from "~/utils/users";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const handle: SendouRouteHandle = {
  i18n: ["user"],
  breadcrumb: () => ({
    imgPath: navIconUrl("u"),
    href: USER_SEARCH_PAGE,
    type: "IMAGE",
  }),
};

export type UserSearchLoaderData = SerializeFrom<typeof loader>;

const searchParamsSchema = z.object({
  q: z.string().max(100).default(""),
  limit: z.coerce.number().int().min(1).max(25).default(25),
});

export const loader = ({ request }: LoaderArgs) => {
  const { q, limit } = parseSearchParams({
    request,
    schema: searchParamsSchema,
  });

  if (!q) return null;

  const identifier = queryToUserIdentifier(q);

  return {
    users: identifier
      ? db.users.searchExact(identifier)
      : db.users.search({ input: q, limit }),
    input: q,
  };
};

export default function UserSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = React.useState(
    searchParams.get("q") ?? ""
  );
  useDebounce(
    () => {
      if (!inputValue) return;

      setSearchParams({ q: inputValue });
    },
    1500,
    [inputValue]
  );

  return (
    <Main className="u-search__container">
      <Input
        className="u-search__input"
        icon={<SearchIcon className="u-search__icon" />}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <UsersList />
    </Main>
  );
}

function UsersList() {
  const { t } = useTranslation(["user"]);
  const data = useLoaderData<typeof loader>();

  if (!data) {
    return <div className="u-search__info">{t("user:search.info")}</div>;
  }

  if (data.users.length === 0) {
    return (
      <div className="u-search__info">
        {t("user:search.noResults", { query: data.input })}
      </div>
    );
  }

  return (
    <ul className="u-search__users">
      {data.users.map((user) => {
        return (
          <li key={user.discordId}>
            <Link to={userPage(user)}>
              <div className="u-search__user">
                <Avatar size="sm" user={user} />
                <div>
                  <div>{discordFullName(user)}</div>
                  {user.inGameName ? (
                    <div className="u-search__ign">
                      {t("user:ign.short")}: {user.inGameName}
                    </div>
                  ) : null}
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
