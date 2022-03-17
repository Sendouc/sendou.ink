import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function main() {
  const stages = await prisma.lfgGroupMatchStage.findMany({
    where: {
      id: null,
    },
  });

  console.log("in total: ", stages.length);
  let count = 1;
  for (const stage of stages) {
    await prisma.lfgGroupMatchStage.update({
      where: {
        lfgGroupMatchId_order: {
          lfgGroupMatchId: stage.lfgGroupMatchId,
          order: stage.order,
        },
      },
      data: {
        id: uuidv4(),
      },
    });

    console.log(count);
    count++;
  }
}

main()
  // eslint-disable-next-line no-console
  .then(() => console.log("done"))
  .catch((e) => console.error(e));
