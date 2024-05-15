import type { ActionFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import { requireUserId } from "~/features/auth/core/user.server";
import { parseRequestFormData, validate } from "~/utils/remix";
import { _action, id } from "~/utils/zod";
import * as LFGRepository from "../LFGRepository.server";
import { isAdmin } from "~/permissions";

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireUserId(request);
  const data = await parseRequestFormData({
    request,
    schema,
  });

  switch (data._action) {
    case "DELETE_POST": {
      const posts = await LFGRepository.posts(user.id);
      const post = posts.find((post) => post.id === data.id);
      validate(post, "Post to delete not found");
      validate(
        isAdmin(user) || post.author.id === user.id,
        "You can only delete your own posts",
      );

      await LFGRepository.deletePost(data.id);

      break;
    }
    case "BUMP_POSTS": {
      // TODO
      break;
    }
  }

  return null;
};

const schema = z.union([
  z.object({
    _action: _action("DELETE_POST"),
    id,
  }),
  z.object({
    _action: _action("BUMP_POSTS"),
  }),
]);
