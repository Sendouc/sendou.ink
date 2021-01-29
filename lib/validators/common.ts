import * as z from "zod";

export const hasNoDuplicates = (arr: any[]) => new Set(arr).size === arr.length;

export const abilityEnum = z.enum([
  "ISM",
  "ISS",
  "REC",
  "RSU",
  "SSU",
  "SCU",
  "SS",
  "SPU",
  "QR",
  "QSJ",
  "BRU",
  "RES",
  "BDU",
  "MPU",
  "OG",
  "LDE",
  "T",
  "CB",
  "NS",
  "H",
  "TI",
  "RP",
  "AD",
  "SJ",
  "OS",
  "DR",
]);
