import * as React from "react";
import { useMatches } from "@remix-run/react";
import {
  type DefaultNamespace,
  type KeyPrefix,
  type Namespace,
  // eslint-disable-next-line @typescript-eslint/no-restricted-imports
  useTranslation as useTranslationOriginal,
  type UseTranslationOptions,
  type UseTranslationResponse,
} from "react-i18next";
import type { SendouRouteHandle } from "~/utils/remix";

// Wraps useTranslation for better error detection with remix-i18next.
// Only has an effect in non-production environments.
export function useTranslation<
  N extends Namespace = DefaultNamespace,
  TKPrefix extends KeyPrefix<N> = undefined
>(
  ns?: N | Readonly<N>,
  options?: UseTranslationOptions<TKPrefix>
): UseTranslationResponse<N, TKPrefix> {
  if (process.env.NODE_ENV !== "production") {
    // These are safe because the condition cannot change at runtime, so the
    // dev build will _always_ call these hooks, and the prod build _never_.

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const matches = useMatches();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const loadedTranslations: Set<string> = React.useMemo(
      () =>
        new Set(
          matches.flatMap((m) => (m.handle as SendouRouteHandle)?.i18n ?? [])
        ),
      [matches]
    );

    // Reset the typing to the actual representation to be able to read from it.
    const nsFixed = ns as string | string[] | undefined;
    const nsArray =
      nsFixed === undefined
        ? ["common"]
        : typeof nsFixed === "string"
        ? [nsFixed]
        : nsFixed;

    for (const singleNs of nsArray) {
      if (!loadedTranslations.has(singleNs)) {
        throw new Error(
          `Tried to access translation file "${singleNs}", but the active routes only configured need for these files: ${JSON.stringify(
            [...loadedTranslations.values()]
          )}.\nForgot to add "${singleNs}" translation to SendouRouteHandle (handle.i18n)?`
        );
      }
    }
  }

  return useTranslationOriginal<N, TKPrefix>(ns, options);
}
