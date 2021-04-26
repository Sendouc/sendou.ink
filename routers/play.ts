import { createRouter } from "pages/api/trpc/[trpc]";
import service from "services/play";

const playApi = createRouter()
  .query("allRegisteredTeams", {
    resolve() {
      return service.allRegisteredTeams();
    },
  })
  .query("nextLadderDay", {
    resolve() {
      return service.nextLadderDay();
    },
  });
export default playApi;
