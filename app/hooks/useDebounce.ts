import * as React from "react";
import { useLatestRef } from "~/hooks/useLatestRef";

/**
 * Runs `fn` once `ms` has elapsed without `deps` changing. Uses a latest-ref instead of `useEffectEvent`,
 * which doesn't update past the first render inside `React.memo`/`forwardRef` components (React 19.2).
 */
export function useDebounce(
	fn: () => void,
	ms = 0,
	deps: React.DependencyList = [],
) {
	const callbackRef = useLatestRef(fn);

	React.useEffect(() => {
		const timeout = setTimeout(() => callbackRef.current(), ms);
		return () => clearTimeout(timeout);
	}, [ms, ...deps]);
}
