import { z } from "zod";
import { TEAM_POST_TYPES, LFG, TIMEZONES } from "../lfg-constants";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { requireUser } from "~/features/auth/core/user.server";
import { parseRequestFormData, validate } from "~/utils/remix";
import { LFG_PAGE } from "~/utils/urls";
import * as LFGRepository from "../LFGRepository.server";
import * as UserRepository from "~/features/user-page/UserRepository.server";
import { falsyToNull, id } from "~/utils/zod";

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireUser(request);
  const data = await parseRequestFormData({
    request,
    schema,
  });

  const identifier = String(user.id);
  const { team } = (await UserRepository.findByIdentifier(identifier)) ?? {};

  const shouldIncludeTeam = TEAM_POST_TYPES.includes(data.type);

  validate(
    !shouldIncludeTeam || team,
    "Team needs to be set for this type of post",
  );

  if (data.postId) {
    await validateCanUpdatePost({
      postId: data.postId,
      user,
    });

    await LFGRepository.updatePost(data.postId, {
      text: data.postText,
      timezone: data.timezone,
      type: data.type,
      teamId: shouldIncludeTeam ? team?.id : undefined,
      plusTierVisibility: data.plusTierVisibility,
    });
  } else {
    await LFGRepository.insertPost({
      text: data.postText,
      timezone: data.timezone,
      type: data.type,
      teamId: shouldIncludeTeam ? team?.id : undefined,
      authorId: user.id,
      plusTierVisibility: data.plusTierVisibility,
    });
  }

  return redirect(LFG_PAGE);
};

const schema = z.object({
  postId: id.optional(),
  type: z.enum(LFG.types),
  postText: z.string().min(LFG.MIN_TEXT_LENGTH).max(LFG.MAX_TEXT_LENGTH),
  timezone: z.string().refine((val) => TIMEZONES.includes(val)),
  plusTierVisibility: z.preprocess(
    falsyToNull,
    z.coerce.number().int().min(1).max(3).nullish(),
  ),
});

const validateCanUpdatePost = async ({
  postId,
  user,
}: {
  postId: number;
  user: { id: number; plusTier: number | null };
}) => {
  const posts = await LFGRepository.posts(user);
  const post = posts.find((post) => post.id === postId);
  validate(post, "Post to update not found");
  validate(post.author.id === user.id, "You can only update your own posts");
};
