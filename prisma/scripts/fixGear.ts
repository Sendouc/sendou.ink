import prisma from "../client";

async function main() {
  const builds = await prisma.build.findMany({});

  const buildsToUpdate: {
    id: number;
    headGear: string | null;
    clothingGear: string | null;
    shoesGear: string | null;
  }[] = [];

  builds.forEach((build) => {
    const trimmedHead =
      typeof build.headGear === "string"
        ? build.headGear.trim()
        : build.headGear;
    const trimmedClothing =
      typeof build.clothingGear === "string"
        ? build.clothingGear.trim()
        : build.clothingGear;
    const trimmedShoes =
      typeof build.shoesGear === "string"
        ? build.shoesGear.trim()
        : build.shoesGear;

    if (
      trimmedHead === build.headGear &&
      trimmedClothing === build.clothingGear &&
      trimmedShoes === build.shoesGear
    ) {
      return;
    }

    buildsToUpdate.push({
      id: build.id,
      headGear: trimmedHead,
      clothingGear: trimmedClothing,
      shoesGear: trimmedShoes,
    });
  });

  console.log(buildsToUpdate[0]);

  await Promise.all(
    buildsToUpdate.map((build) =>
      prisma.build.update({
        where: { id: build.id },
        data: {
          headGear: build.headGear,
          clothingGear: build.clothingGear,
          shoesGear: build.shoesGear,
        },
      })
    )
  );
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
