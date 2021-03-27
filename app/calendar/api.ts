import { createRouter } from "pages/api/trpc/[trpc]";
import { throwIfNotLoggedIn } from "utils/api";
import { eventSchema } from "utils/validators/event";
import service from "./service";

const plusApi = createRouter().mutation("addEvent", {
  input: eventSchema,
  resolve({ ctx, input }) {
    const user = throwIfNotLoggedIn(ctx.user);
    return service.addEvent({ input, userId: user.id });
  },
});
export default plusApi;
