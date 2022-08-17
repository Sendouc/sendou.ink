import type { MapPool } from "./types";

export function mapPoolToSerializedString(mapPool: MapPool): string {
  if (mapPool) {
    return "1";
  }

  return "2";
}

export function serializedStringToMapPool(serialized: string): MapPool {
  return {
    SZ: serialized ? [] : [],
    CB: [],
    RM: [],
    TC: [],
    TW: [],
  };
}

// pool=tw:1998;sz:1d0a;tc:164c;rm:15e0;cb:1ce0
