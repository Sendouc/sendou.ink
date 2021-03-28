import { Factory } from "fishery";
import { User } from "@prisma/client";
import prisma from "../../prisma/client";

export default Factory.define<User>(({ sequence, onCreate }) => {
  onCreate(user => {
    return prisma.user.create({ data: user });
  });

  return {
    id: sequence,
    discordId: sequence.toString().padStart(17, '0'),
    discordAvatar: "???",
    discriminator: sequence.toString().padStart(4, '0'),
    username: `User${sequence}`,
    patreonTier: 0,
    canPostEvents: false,
    teamId: null,
    ladderTeamId: null
  };
});
