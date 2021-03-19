import { createRouter } from "pages/api/trpc/[trpc]";
import { throwIfNotLoggedIn } from "utils/api";
import { suggestionFullSchema } from "utils/validators/suggestion";
import { votesSchema } from "utils/validators/votes";
import { vouchSchema } from "utils/validators/vouch";
import service from "./service";

const plusApi = createRouter()
  .query("suggestions", {
    resolve() {
      return service.getSuggestions();
    },
  })
  .query("statuses", {
    resolve() {
      return service.getPlusStatuses();
    },
  })
  .query("usersForVoting", {
    resolve({ ctx }) {
      const user = throwIfNotLoggedIn(ctx.user);
      return service.getUsersForVoting(user.id);
    },
  })
  .query("hasVoted", {
    resolve({ ctx }) {
      const user = throwIfNotLoggedIn(ctx.user);
      return service.hasVoted(user.id);
    },
  })
  .mutation("suggestion", {
    input: suggestionFullSchema,
    resolve({ input, ctx }) {
      const user = throwIfNotLoggedIn(ctx.user);
      return service.addSuggestion({ input, userId: user.id });
    },
  })
  .mutation("vouch", {
    input: vouchSchema,
    resolve({ input, ctx }) {
      const user = throwIfNotLoggedIn(ctx.user);
      return service.addVouch({ input, userId: user.id });
    },
  })
  .mutation("vote", {
    input: votesSchema,
    resolve({ input, ctx }) {
      const user = throwIfNotLoggedIn(ctx.user);
      return service.addVotes({ input, userId: user.id });
    },
  });
export default plusApi;
