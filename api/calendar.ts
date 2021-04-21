import { createRouter } from "pages/api/trpc/[trpc]";
import service from "services/calendar";
import { throwIfNotLoggedIn } from "utils/api";
import { eventSchema } from "utils/validators/event";
import * as z from "zod";

const calendarApi = createRouter()
  .query("events", {
    resolve() {
      return service.events();
    },
  })
  .mutation("addEvent", {
    input: eventSchema,
    resolve({ ctx, input }) {
      const user = throwIfNotLoggedIn(ctx.user);
      return service.addEvent({ input, userId: user.id });
    },
  })
  .mutation("editEvent", {
    input: z.object({ event: eventSchema, eventId: z.number() }),
    resolve({ ctx, input }) {
      const user = throwIfNotLoggedIn(ctx.user);
      return service.editEvent({
        ...input,
        userId: user.id,
      });
    },
  })
  .mutation("deleteEvent", {
    input: z.object({ eventId: z.number() }),
    resolve({ ctx, input }) {
      const user = throwIfNotLoggedIn(ctx.user);
      return service.deleteEvent({
        eventId: input.eventId,
        userId: user.id,
      });
    },
  });
export default calendarApi;
