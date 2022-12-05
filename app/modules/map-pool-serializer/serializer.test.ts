import { suite } from "uvu";
import * as assert from "uvu/assert";
import {
  mapPoolToSerializedString,
  serializedStringToMapPool,
} from "./serializer";
import type { MapPoolObject } from "./types";

const Serializer = suite("Map pool serializer");

const testSerializedPool = "tw:6660;sz:7428;tc:5930;rm:5780;cb:7380";

Serializer("Unserializes and then serializes to same result", () => {
  const mapPool = serializedStringToMapPool(testSerializedPool);

  assert.equal(mapPoolToSerializedString(mapPool), testSerializedPool);
});

Serializer("Ignores invalid mode key", () => {
  const testSerializedPoolWithInvalidMode = `${testSerializedPool};ab:1ce0`;
  const mapPool = serializedStringToMapPool(testSerializedPoolWithInvalidMode);

  assert.equal(mapPoolToSerializedString(mapPool), testSerializedPool);
});

Serializer("Matching serialization with IPLMapGen2", () => {
  const testMapPool: MapPoolObject = {
    // Gorge, Spillway, Mincemeat, Mahi-Mahi, Inkblot
    TW: [0, 3, 4, 7, 8],
    // Gorge, Eeltail, Spillway, Inkblot, MakoMart
    SZ: [0, 1, 3, 8, 10],
    // Eeltail, Hagglefish, Bridge, Inbklot, Sturgeon
    TC: [1, 2, 5, 8, 9],
    // Eeltail, Spillway, Mincemeat, Bridge, Museum
    RM: [1, 3, 4, 5, 6],
    // Gorge, Eeltail, Mincemeat, Bridge, Museum
    CB: [0, 1, 4, 5, 6],
  };

  assert.equal(mapPoolToSerializedString(testMapPool), testSerializedPool);
});

Serializer("Omits key if mode has no maps", () => {
  const testPoolWithoutTw: MapPoolObject = {
    CB: [1, 2],
    RM: [1, 8],
    TC: [8, 4],
    SZ: [10],
    TW: [],
  };

  const serialized = mapPoolToSerializedString(testPoolWithoutTw);

  assert.ok(serialized.includes("sz") && !serialized.includes("tw"));
});

Serializer("Returns empty string if no maps", () => {
  const testPoolWithoutTw: MapPoolObject = {
    CB: [],
    RM: [],
    TC: [],
    SZ: [],
    TW: [],
  };

  const serialized = mapPoolToSerializedString(testPoolWithoutTw);

  assert.equal(serialized, "");
});

Serializer("Value of two modes is the same with same maps", () => {
  const testPoolWithDuplicateMaps: MapPoolObject = {
    CB: [1, 2],
    RM: [1, 2],
    TC: [],
    SZ: [],
    TW: [],
  };

  const serialized = mapPoolToSerializedString(testPoolWithDuplicateMaps);

  const [modeOne, modeTwo] = serialized.split(";");
  if (!modeOne || !modeTwo) {
    throw new Error("Map pool is missing modes");
  }

  assert.equal(modeOne.split(":")[1], modeTwo.split(":")[1]);
});

Serializer.run();
