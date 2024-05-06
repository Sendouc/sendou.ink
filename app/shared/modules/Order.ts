import { Order, pipe } from "effect";

// xxx: eslint to prevent importing from effect order

export * from "effect/Order";

export const booleanReversed = pipe(Order.boolean, Order.reverse);
