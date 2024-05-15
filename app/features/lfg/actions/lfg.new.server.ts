import { z } from "zod";
import { TEAM_POST_TYPES, LFG, TIMEZONES } from "../lfg-constants";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { requireUserId } from "~/features/auth/core/user.server";
import { parseRequestFormData, validate } from "~/utils/remix";
import { LFG_PAGE } from "~/utils/urls";
import * as LFGRepository from "../LFGRepository.server";
import * as UserRepository from "~/features/user-page/UserRepository.server";
import { id } from "~/utils/zod";

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireUserId(request);
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
      userId: user.id,
    });

    await LFGRepository.updatePost(data.postId, {
      text: data.postText,
      timezone: data.timezone,
      type: data.type,
      teamId: shouldIncludeTeam ? team?.id : undefined,
    });
  } else {
    await LFGRepository.insertPost({
      text: data.postText,
      timezone: data.timezone,
      type: data.type,
      teamId: shouldIncludeTeam ? team?.id : undefined,
      authorId: user.id,
    });
  }

  return redirect(LFG_PAGE);
};

const schema = z.object({
  postId: id.optional(),
  type: z.enum(LFG.types),
  postText: z.string().min(LFG.MIN_TEXT_LENGTH).max(LFG.MAX_TEXT_LENGTH),
  timezone: z.string().refine((val) => TIMEZONES.includes(val)),
});

const validateCanUpdatePost = async ({
  postId,
  userId,
}: {
  postId: number;
  userId: number;
}) => {
  const posts = await LFGRepository.posts(userId);
  const post = posts.find((post) => post.id === postId);
  validate(post, "Post to update not found");
  validate(post.author.id === userId, "You can only update your own posts");
};
