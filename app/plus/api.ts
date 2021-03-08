import { createRouter } from "pages/api/trpc/[trpc]";
import { throwIfNotLoggedIn } from "utils/api";
import { suggestionFullSchema } from "utils/validators/suggestion";
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
  .mutation("suggestion", {
    input: suggestionFullSchema,
    resolve({ input, ctx }) {
      const user = throwIfNotLoggedIn(ctx.user);
      return service.addSuggestion({ input, userId: user.id });
    },
  });

export default plusApi;
