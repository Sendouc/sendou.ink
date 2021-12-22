import { Mode } from ".prisma/client";
import { z } from "zod";
import { assertType, Unpacked } from "~/utils";

type MapList = z.infer<typeof ModeSchema>;
assertType<Unpacked<MapList>, Mode>();

export const ModeSchema = z.enum(["TW", "SZ", "TC", "RM", "CB"]);
