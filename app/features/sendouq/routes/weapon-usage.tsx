import type { LoaderArgs, SerializeFrom } from "@remix-run/node";
import { parseSearchParams } from "~/utils/remix";
import { weaponUsageSearchParamsSchema } from "../q-schemas.server";
import { weaponUsageStats } from "../queries/weaponUsageStats.server";

export type WeaponUsageLoaderData = SerializeFrom<typeof loader>;

export const loader = ({ request }: LoaderArgs) => {
  const data = parseSearchParams({
    request,
    schema: weaponUsageSearchParamsSchema,
  });

  return {
    usage: weaponUsageStats({
      mode: data.modeShort,
      season: data.season,
      stageId: data.stageId,
      userId: data.userId,
    }),
  };
};
