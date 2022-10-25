import { useMemo } from "react";

/**
 * Utility hook for calling `useMemo(f, [])`, when you're sure it needs no
 * revalidation but feel bad for getting shamed by eslint everytime :D
 */
export function useOnce<T>(factory: () => T) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, []);
}
