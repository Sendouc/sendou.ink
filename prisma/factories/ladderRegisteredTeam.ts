import { Prisma } from "@prisma/client";
import { Factory } from "fishery";
import { v4 as uuidv4 } from "uuid";
import prisma from "../client";

export default Factory.define<Prisma.LadderRegisteredTeamCreateManyInput>(
  ({ sequence, onCreate }) => {
    onCreate((data) => {
      return prisma.ladderRegisteredTeam.create({ data });
    });

    return {
      id: sequence,
      inviteCode: uuidv4(),
      ownerId: sequence,
    };
  }
);
