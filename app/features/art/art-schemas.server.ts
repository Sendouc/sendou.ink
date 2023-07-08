import { z } from "zod";
import { ART } from "./art-constants";
import {
  checkboxValueToDbBoolean,
  dbBoolean,
  falsyToNull,
  id,
  processMany,
  removeDuplicates,
  safeJSONParse,
} from "~/utils/zod";

const description = z.preprocess(
  falsyToNull,
  z.string().max(ART.DESCRIPTION_MAX_LENGTH).nullable()
);
const linkedUsers = z.preprocess(
  processMany(safeJSONParse, removeDuplicates),
  z.array(id).max(ART.LINKED_USERS_MAX_LENGTH)
);
export const newArtSchema = z.object({
  description,
  linkedUsers,
});

export const editArtSchema = z.object({
  description,
  linkedUsers,
  isShowcase: z.preprocess(checkboxValueToDbBoolean, dbBoolean),
});
