import { sql } from "~/db/sql";
import type { Art, User, UserSubmittedImage } from "~/db/types";
import { parseDBArray } from "~/utils/sql";

const stm = sql.prepare(/* sql */ `
  select 
    "Art"."isShowcase",
    "Art"."description",
    "Art"."authorId",
    "UserSubmittedImage"."url",
    json_group_array("ArtUserMetadata"."userId") as "linkedUsers"
  from "Art"
  left join "ArtUserMetadata" on "Art"."id" = "ArtUserMetadata"."artId"
  inner join "UserSubmittedImage" on "Art"."imgId" = "UserSubmittedImage"."id"
  where "Art"."id" = @artId
  group by "Art"."id"
`);

interface FindArtById {
  isShowcase: Art["isShowcase"];
  description: Art["description"];
  url: UserSubmittedImage["url"];
  authorId: Art["authorId"];
  linkedUsers: User["id"][];
}

export function findArtById(artId: number): FindArtById | null {
  const art = stm.get({ artId }) as any;
  if (!art) return null;

  return {
    ...art,
    linkedUsers: parseDBArray(art.linkedUsers),
  };
}
