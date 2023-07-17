import { sql } from "~/db/sql";
import type { MainWeaponId } from "~/modules/in-game-lists";
import { removeDuplicates } from "~/utils/arrays";

const insertStm = sql.prepare(/* sql */ `
  insert into "ReportedWeapon" 
    ("groupMatchMapId", "weaponSplId", "userId")
  values (@groupMatchMapId, @weaponSplId, @userId)
`);

const deleteStm = sql.prepare(/* sql */ `
  delete from "ReportedWeapon"
  where "groupMatchMapId" = @groupMatchMapId
`);

export const addReportedWeapons = sql.transaction(
  (
    args: {
      groupMatchMapId: number;
      weaponSplId: MainWeaponId;
      userId: number;
    }[]
  ) => {
    const groupMatchMapIds = removeDuplicates(
      args.map((a) => a.groupMatchMapId)
    );

    for (const groupMatchMapId of groupMatchMapIds) {
      deleteStm.run({ groupMatchMapId });
    }

    for (const { groupMatchMapId, userId, weaponSplId } of args) {
      insertStm.run({ groupMatchMapId, userId, weaponSplId });
    }
  }
);
