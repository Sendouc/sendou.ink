import {
  mapPoolToSerializedString,
  serializedStringToMapPool,
} from "./serializer";
import type { ReadonlyMapPoolObject, MapPoolObject } from "./types";
import clone from "just-clone";
import type { MapPoolMap } from "~/db/types";
import { mapPoolListToMapPoolObject } from "~/modules/map-list-generator";
import {
  type ModeShort,
  type StageId,
  stageIds,
} from "~/modules/in-game-lists";

type DbMapPoolList = Array<Pick<MapPoolMap, "stageId" | "mode">>;

export class MapPool {
  private source: string | ReadonlyMapPoolObject;
  private asSerialized?: string;
  private asObject?: ReadonlyMapPoolObject;

  constructor(init: ReadonlyMapPoolObject | string | DbMapPoolList) {
    this.source = Array.isArray(init) ? mapPoolListToMapPoolObject(init) : init;
  }

  static serialize(init: ReadonlyMapPoolObject | string | DbMapPoolList) {
    return new MapPool(init).serialized;
  }

  static parse(init: MapPoolObject | string | DbMapPoolList) {
    return new MapPool(init).parsed;
  }

  static toDbList(init: MapPoolObject | string | DbMapPoolList) {
    return new MapPool(init).dbList;
  }

  get serialized(): string {
    if (this.asSerialized !== undefined) {
      return this.asSerialized;
    }

    return (this.asSerialized =
      typeof this.source === "string"
        ? this.source
        : mapPoolToSerializedString(this.source));
  }

  get parsed(): ReadonlyMapPoolObject {
    if (this.asObject !== undefined) {
      return this.asObject;
    }

    return (this.asObject =
      typeof this.source === "string"
        ? serializedStringToMapPool(this.source)
        : this.source);
  }

  get dbList(): DbMapPoolList {
    return Object.entries(this.parsed).flatMap(([mode, stages]) =>
      stages.flatMap((stageId) => ({ mode: mode as ModeShort, stageId }))
    );
  }

  get stages() {
    return Object.values(this.parsed).flat();
  }

  hasMode(mode: ModeShort): boolean {
    return this.parsed[mode].length > 0;
  }

  hasStage(stageId: StageId): boolean {
    return Object.values(this.parsed).some((stages) =>
      stages.includes(stageId)
    );
  }

  isEmpty(): boolean {
    return Object.values(this.parsed).every((stages) => stages.length === 0);
  }

  getClonedObject(): MapPoolObject {
    return clone(this.parsed) as MapPoolObject;
  }

  toString() {
    return this.serialized;
  }

  toJSON() {
    return this.parsed;
  }

  static EMPTY = new MapPool({
    SZ: [],
    TC: [],
    CB: [],
    RM: [],
    TW: [],
  });

  static ALL = new MapPool({
    SZ: [...stageIds],
    TC: [...stageIds],
    CB: [...stageIds],
    RM: [...stageIds],
    TW: [...stageIds],
  });

  static ANARCHY = new MapPool({
    SZ: [...stageIds],
    TC: [...stageIds],
    CB: [...stageIds],
    RM: [...stageIds],
    TW: [],
  });

  static SZ = new MapPool({
    ...MapPool.EMPTY.parsed,
    SZ: [...stageIds],
  });
  static TC = new MapPool({
    ...MapPool.EMPTY.parsed,
    TC: [...stageIds],
  });
  static CB = new MapPool({
    ...MapPool.EMPTY.parsed,
    CB: [...stageIds],
  });
  static RM = new MapPool({
    ...MapPool.EMPTY.parsed,
    RM: [...stageIds],
  });
  static TW = new MapPool({
    ...MapPool.EMPTY.parsed,
    TW: [...stageIds],
  });
}
