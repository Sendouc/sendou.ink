import type { LoaderFunctionArgs } from "@remix-run/node";
import { requireUserId } from "~/features/auth/core/user.server";
import * as UserRepository from "~/features/user-page/UserRepository.server";
import * as QSettingsRepository from "~/features/sendouq-settings/QSettingsRepository.server";
import { z } from "zod";
import { id } from "~/utils/zod";
import { parseSafeSearchParams } from "~/utils/remix";
import * as LFGRepository from "../LFGRepository.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUserId(request);

  const userProfileData = await UserRepository.findByIdentifier(
    String(user.id),
  );
  const userQSettingsData = await QSettingsRepository.settingsByUserId(user.id);

  return {
    team: userProfileData?.team,
    weaponPool: userProfileData?.weapons,
    languages: userQSettingsData.languages,
    postToEdit: await buildToEditFromSearchParams(request, user.id),
  };
};

const searchParamsSchema = z.object({
  postId: id,
});

const buildToEditFromSearchParams = async (
  request: LoaderFunctionArgs["request"],
  userId: number,
) => {
  const params = parseSafeSearchParams({ request, schema: searchParamsSchema });

  if (!params.success) return;

  const allPosts = await LFGRepository.posts(userId);
  const post = allPosts.find(
    (p) => p.id === params.data.postId && p.author.id === userId,
  );

  return post;
};
