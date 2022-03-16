import { weapons } from "~/constants";

export function weaponsInGameOrder(a: string, b: string) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  return weapons.indexOf(a as any) - weapons.indexOf(b as any);
}
