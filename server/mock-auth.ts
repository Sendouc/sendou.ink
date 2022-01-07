import { User } from "@prisma/client";
import type { Express } from "express";
import { z } from "zod";
import { db } from "~/utils/db.server";
import type { LoggedInUser } from "~/validators/user";

export function setUpMockAuth(
  app: Express,
  userObj: { user: LoggedInUser | null }
): void {
  if (process.env.NODE_ENV !== "development") return;

  app.post("/mock-auth", async (req, res) => {
    try {
      const data = z
        .object({ username: z.string().nullish(), team: z.string().nullish() })
        .parse(req.query);

      const allUsers = await db.user.findMany({});

      let newMockUser: User | undefined;
      if (data.username) {
        const username = data.username.toLowerCase().trim();
        newMockUser = allUsers.find(
          (user) => user.discordName.toLowerCase() === username
        );
      } else if (data.team) {
        const team = data.team.toLowerCase().trim();
        const teams = await db.tournamentTeam.findMany({
          include: { members: { include: { member: true } } },
        });

        const wantedTeam = teams.find(
          (teamFromDb) => teamFromDb.name.toLowerCase() === team.toLowerCase()
        );
        if (!wantedTeam) return res.status(400).end();

        const captain = wantedTeam.members.find((member) => member.captain);
        if (!captain) return res.status(400).end();

        newMockUser = captain.member;
      }

      if (!newMockUser) return res.status(400).end();

      userObj.user = {
        discordAvatar: newMockUser.discordAvatar,
        discordId: newMockUser.discordId,
        id: newMockUser.id,
      };
    } catch {
      return res.status(400).end();
    }

    res.status(200).end();
  });
}
