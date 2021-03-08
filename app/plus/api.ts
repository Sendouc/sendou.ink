import { createRouter } from "pages/api/trpc/[trpc]";
import service from "./service";

const plusApi = createRouter()
  .query("Suggestions", {
    resolve() {
      return service.getSuggestions();
    },
  })
  .query("Statuses", {
    resolve() {
      return service.getPlusStatuses();
    },
  });

export default plusApi;
