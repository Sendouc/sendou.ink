import { parseSearchParams } from "~/utils/remix";
import { weaponUsageStats } from "../queries/weaponUsageStats.server";
import type { LoaderFunctionArgs, SerializeFrom } from "@remix-run/node";
import { weaponUsageSearchParamsSchema } from "../q-schemas.server";
import type { ModeShort, StageId } from "~/modules/in-game-lists";

export type WeaponUsageLoaderData = SerializeFrom<typeof loader>;

export const loader = ({ request }: LoaderFunctionArgs) => {
  const data = parseSearchParams({
    request,
    schema: weaponUsageSearchParamsSchema,
  });

  return {
    usage: weaponUsageStats({
      mode: data.modeShort as ModeShort,
      season: data.season,
      stageId: data.stageId as StageId,
      userId: data.userId,
    }),
  };
};
