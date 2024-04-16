import { invariant as epicWebInvariant } from "@epic-web/invariant";

export function invariant(
  condition: unknown,
  message?: string,
): asserts condition {
  epicWebInvariant(condition, message ?? "Invariant failed");
}
