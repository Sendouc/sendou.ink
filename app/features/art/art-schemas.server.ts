import { z } from "zod";
import { ART } from "./art-constants";
import {
  checkboxValueToDbBoolean,
  dbBoolean,
  falsyToNull,
  id,
  safeJSONParse,
} from "~/utils/zod";

const description = z.preprocess(
  falsyToNull,
  z.string().max(ART.DESCRIPTION_MAX_LENGTH).nullable()
);
const linkedUsers = z.preprocess(
  safeJSONParse,
  z.array(id).max(ART.LINKED_USERS_MAX_LENGTH)
);
export const newArtSchema = z.union([
  z.object({
    _action: z.literal("NEW"),
    description,
    linkedUsers,
  }),
  z.object({
    _action: z.literal("EDIT"),
    description,
    linkedUsers,
    isShowcase: z.preprocess(checkboxValueToDbBoolean, dbBoolean),
  }),
]);
