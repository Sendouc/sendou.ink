import * as React from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

/**
 * Ref holding the latest `value`, for effects and event handlers that need it without re-running or
 * re-subscribing when it changes. Synced in a layout effect (not during render, which the React
 * Compiler rejects), so reading it during render or in a child's layout effect can see the previous value.
 */
export function useLatestRef<T>(value: T) {
	const ref = React.useRef(value);
	useIsomorphicLayoutEffect(() => {
		ref.current = value;
	});
	return ref;
}
