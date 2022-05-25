export function assertUnreachable(x: never): never {
  throw new Error(
    `Didn't expect to get here. Unexpected value: ${JSON.stringify(x)}`
  );
}

export type Unpacked<T> = T extends (infer U)[]
  ? U
  : T extends (...args: unknown[]) => infer U
  ? U
  : T extends Promise<infer U>
  ? U
  : T;
