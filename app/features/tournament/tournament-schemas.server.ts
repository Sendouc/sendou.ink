import { z } from "zod";

export const registerSchema = z.union([
  z.object({ _action: z.literal("CREATE_TEAM") }),
  z.object({ _action: z.literal("placeholder") }),
]);
