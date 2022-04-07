import { z } from "zod";

export const groupStatus = z.enum(["PRE_ADD", "LOOKING", "MATCH", "INACTIVE"]);
export const activeGroupStatus = z.enum(["PRE_ADD", "LOOKING", "MATCH"]);

export const groupType = z.enum(["TWIN", "QUAD", "VERSUS"]);
