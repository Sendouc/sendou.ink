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
  })
  .query("previousLadderDay", {
    resolve() {
      return service.previousLadderDay();
    },
  });
export default playApi;
