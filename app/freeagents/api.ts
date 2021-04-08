import { createRouter } from "pages/api/trpc/[trpc]";
import { throwIfNotLoggedIn } from "utils/api";
import { freeAgentPostSchema } from "utils/validators/fapost";
import * as z from "zod";
import service from "./service";

const freeAgentsApi = createRouter()
  .query("posts", {
    resolve() {
      return service.posts();
    },
  })
  .query("likes", {
    resolve({ ctx }) {
      const user = throwIfNotLoggedIn(ctx.user);
      return service.likes(user.id);
    },
  })
  .mutation("upsertPost", {
    input: freeAgentPostSchema,
    resolve({ ctx, input }) {
      const user = throwIfNotLoggedIn(ctx.user);
      return service.upsertPost({ input, userId: user.id });
    },
  })
  .mutation("deletePost", {
    resolve({ ctx }) {
      const user = throwIfNotLoggedIn(ctx.user);
      return service.deletePost(user.id);
    },
  })
  .mutation("addLike", {
    input: z.object({ postId: z.number() }),
    resolve({ ctx, input }) {
      const user = throwIfNotLoggedIn(ctx.user);
      return service.addLike({ userId: user.id, postId: input.postId });
    },
  })
  .mutation("deleteLike", {
    input: z.object({ postId: z.number() }),
    resolve({ ctx, input }) {
      const user = throwIfNotLoggedIn(ctx.user);
      return service.deleteLike({ userId: user.id, postId: input.postId });
    },
  });

export default freeAgentsApi;
