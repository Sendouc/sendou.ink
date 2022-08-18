import { suite } from "uvu";
import * as assert from "uvu/assert";
import {
  mapPoolToSerializedString,
  serializedStringToMapPool,
} from "./serializer";
import type { MapPool } from "./types";

const Serializer = suite("Map pool serializer");

const testSerializedPool = "tw:1998;sz:1d0a;tc:164c;rm:15e0;cb:1ce0";

Serializer("Unserializes and then serializes to same result", () => {
  const mapPool = serializedStringToMapPool(testSerializedPool);

  assert.equal(mapPoolToSerializedString(mapPool), testSerializedPool);
});

Serializer("Ignores invalid mode key", () => {
  const testSerializedPoolWithInvalidMode = `${testSerializedPool};ab:1ce0`;
  const mapPool = serializedStringToMapPool(testSerializedPoolWithInvalidMode);

  assert.equal(mapPoolToSerializedString(mapPool), testSerializedPool);
});

Serializer("Ignores invalid mode key", () => {
  const mapPool = serializedStringToMapPool(testSerializedPool);

  assert.equal(mapPoolToSerializedString(mapPool), testSerializedPool);
});

Serializer("Matching serialization with IPLMapGen2", () => {
  const testMapPool: MapPool = {
    TW: [
      "Scorch Gorge",
      "Undertow Spillway",
      "Mincemeat Metalworks",
      "Mahi-Mahi Resort",
      "Inkblot Art Academy",
    ],
    SZ: [
      "Scorch Gorge",
      "Eeltail Alley",
      "Undertow Spillway",
      "Inkblot Art Academy",
      "MakoMart",
    ],
    TC: [
      "Eeltail Alley",
      "Hagglefish Market",
      "Hammerhead Bridge",
      "Inkblot Art Academy",
      "Sturgeon Shipyard",
    ],
    RM: [
      "Eeltail Alley",
      "Undertow Spillway",
      "Mincemeat Metalworks",
      "Hammerhead Bridge",
      "Museum d'Alfonsino",
    ],
    CB: [
      "Scorch Gorge",
      "Eeltail Alley",
      "Mincemeat Metalworks",
      "Hammerhead Bridge",
      "Museum d'Alfonsino",
    ],
  };

  assert.equal(mapPoolToSerializedString(testMapPool), testSerializedPool);
});

Serializer("Omits key if mode has no maps", () => {
  const testPoolWithoutTw: MapPool = {
    CB: ["Eeltail Alley", "Hagglefish Market"],
    RM: ["Eeltail Alley", "Inkblot Art Academy"],
    TC: ["Inkblot Art Academy", "Mincemeat Metalworks"],
    SZ: ["MakoMart"],
    TW: [],
  };

  const serialized = mapPoolToSerializedString(testPoolWithoutTw);

  assert.ok(serialized.includes("sz") && !serialized.includes("tw"));
});

Serializer("Returns empty string if no maps", () => {
  const testPoolWithoutTw: MapPool = {
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
  const testPoolWithDuplicateMaps: MapPool = {
    CB: ["Eeltail Alley", "Hagglefish Market"],
    RM: ["Eeltail Alley", "Hagglefish Market"],
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
