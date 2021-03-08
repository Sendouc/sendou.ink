import { createRouter } from "pages/api/trpc/[trpc]";
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
    resolve({ input }) {
      return service.getPlusStatuses();
    },
  });

export default plusApi;
