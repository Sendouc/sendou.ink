import { _action, actualNumber } from "~/utils/zod";
import { z } from "zod";

export const adminActionSchema = z.union([
  z.object({
    _action: _action("MIGRATE"),
    "old-user": z.preprocess(actualNumber, z.number().positive()),
    "new-user": z.preprocess(actualNumber, z.number().positive()),
  }),
  z.object({
    _action: _action("REFRESH"),
  }),
  z.object({
    _action: _action("CLEAN_UP"),
  }),
  z.object({
    _action: _action("FORCE_PATRON"),
    user: z.preprocess(actualNumber, z.number().positive()),
    patronTier: z.preprocess(actualNumber, z.number()),
    patronTill: z.string(),
  }),
  z.object({
    _action: _action("VIDEO_ADDER"),
    user: z.preprocess(actualNumber, z.number().positive()),
  }),
  z.object({
    _action: _action("ARTIST"),
    user: z.preprocess(actualNumber, z.number().positive()),
  }),
  z.object({
    _action: _action("LINK_PLAYER"),
    user: z.preprocess(actualNumber, z.number().positive()),
    playerId: z.preprocess(actualNumber, z.number().positive()),
  }),
]);
