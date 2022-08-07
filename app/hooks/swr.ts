import useSWRImmutable from "swr/immutable";
import type { UsersLoaderData } from "~/routes/users";

const ALL_USERS_ROUTE = "/users?_data=routes%2Fusers";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  return res.json();
};

export function useUsers() {
  const { data, error } = useSWRImmutable<UsersLoaderData>(
    ALL_USERS_ROUTE,
    fetcher
  );

  return {
    users: data?.users,
    isLoading: !error && !data,
    isError: error,
  };
}
