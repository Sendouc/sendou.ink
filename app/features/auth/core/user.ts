import { useMatches } from "@remix-run/react";
import { Option } from "effect";
import invariant from "tiny-invariant";
import type { RootLoaderData } from "~/root";
import { User } from "~/shared/models";
import * as Schema from "@effect/schema/Schema";

// TODO: unify

export function useUser() {
  const [root] = useMatches();
  invariant(root);

  return (root.data as RootLoaderData | undefined)?.user;
}

export function useUserOption() {
  const [root] = useMatches();
  invariant(root);

  const user = (root.data as RootLoaderData | undefined)?.user;

  return user
    ? Option.some(Schema.decodeSync(User)(user))
    : Option.none<User>();
}

export type MaybeLoggedInUser = ReturnType<typeof useUserOption>;
