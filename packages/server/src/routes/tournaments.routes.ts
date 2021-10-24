import { App } from "@tinyhttp/app";
import { findTournamentByNameForUrl } from "../services/tournament";

const app = new App();

app.get("/:organization/:tournament", async (req, res) => {
  const { organization, tournament } = req.params;
  const tournamentFromDB = await findTournamentByNameForUrl({
    organizationNameForUrl: organization,
    tournamentNameForUrl: tournament,
  });

  if (!tournamentFromDB) return res.sendStatus(404);

  res.json(tournamentFromDB);
});

export default app;
