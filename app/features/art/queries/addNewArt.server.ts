import { sql } from "~/db/sql";
import type { Art, UserSubmittedImage } from "~/db/types";

const addImgStm = sql.prepare(/* sql */ `
  insert into "UnvalidatedUserSubmittedImage"
    ("submitterUserId", "url", "validatedAt")
  values
    (@authorId, @url, @validatedAt)
  returning *
`);

const addArtStm = sql.prepare(/* sql */ `
  insert into "Art"
    (
      "authorId",
      "description",
      "imgId",
      "isShowcase"
    )
  values
    (
      @authorId,
      @description,
      @imgId,
      -- ensures first art is always showcase
      not exists (
        select
          1
        from
          "Art"
        where
          "authorId" = @authorId
      )
    )
  returning *
`);

const updateArtStm = sql.prepare(/* sql */ `
  update
    "Art"
  set
    "description" = @description,
    "isShowcase" = @isShowcase
  where
    "id" = @artId
`);

const removeIsShowcaseFromAllStm = sql.prepare(/* sql */ `
  update
    "Art"
  set
    "isShowcase" = 0
  where
    "authorId" = @authorId
`);

const addArtUserMetadataStm = sql.prepare(/* sql */ `
  insert into "ArtUserMetadata"
    ("artId", "userId")
  values
    (@artId, @userId)
`);

const removeUserMetadataStm = sql.prepare(/* sql */ `
  delete from
    "ArtUserMetadata"
  where
    "artId" = @artId
`);

type AddNewArtArgs = Pick<Art, "authorId" | "description"> &
  Pick<UserSubmittedImage, "url" | "validatedAt"> & { linkedUsers: number[] };

export const addNewArt = sql.transaction((args: AddNewArtArgs) => {
  const img = addImgStm.get(args) as UserSubmittedImage;
  const art = addArtStm.get({ ...args, imgId: img.id }) as Art;

  for (const userId of args.linkedUsers) {
    addArtUserMetadataStm.run({ artId: art.id, userId });
  }
});

type EditArtArgs = Pick<Art, "authorId" | "description" | "isShowcase"> & {
  linkedUsers: number[];
  artId: number;
};

export const editArt = sql.transaction((args: EditArtArgs) => {
  if (args.isShowcase) {
    removeIsShowcaseFromAllStm.run({
      authorId: args.authorId,
    });
  }

  updateArtStm.run({
    description: args.description,
    isShowcase: args.isShowcase,
    artId: args.artId,
  });

  removeUserMetadataStm.run({ artId: args.artId });
  for (const userId of args.linkedUsers) {
    addArtUserMetadataStm.run({ artId: args.artId, userId });
  }
});
