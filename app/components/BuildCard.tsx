import clsx from "clsx";
import { useTranslation } from "react-i18next";
import type { AllAbilitiesTuple } from "~/db/models/builds/queries.server";
import type { Build, BuildWeapon } from "~/db/types";
import { useIsMounted } from "~/hooks/useIsMounted";
import type { ModeShort } from "~/modules/in-game-lists";
import { databaseTimestampToDate } from "~/utils/dates";
import { gearImageUrl, modeImageUrl, weaponImageUrl } from "~/utils/urls";
import { Ability } from "./Ability";
import { Image } from "./Image";

type BuildProps = Pick<
  Build,
  | "title"
  | "description"
  | "clothesGearSplId"
  | "headGearSplId"
  | "shoesGearSplId"
  | "updatedAt"
  | "modes"
> & {
  abilities: AllAbilitiesTuple;
  modes: ModeShort[] | null;
  weapons: Array<BuildWeapon["weaponSplId"]>;
};

export function BuildCard({
  title,
  weapons,
  updatedAt,
  headGearSplId,
  clothesGearSplId,
  shoesGearSplId,
  abilities,
  modes,
}: BuildProps) {
  const { i18n } = useTranslation();
  const isMounted = useIsMounted();

  return (
    <div className="build">
      <div>
        <div className="build__top-row">
          <h2 className="build__title">{title}</h2>
          {modes && modes.length > 0 && (
            <div className="build__modes">
              {modes.map((mode) => (
                <Image
                  // xxx: alt to translated name + title
                  // xxx: maybe border same as gear img?
                  alt=""
                  path={modeImageUrl(mode)}
                  width={18}
                  height={18}
                />
              ))}
            </div>
          )}
        </div>
        <time className={clsx("build__date", { invisible: !isMounted })}>
          {isMounted
            ? databaseTimestampToDate(updatedAt).toLocaleDateString(
                i18n.language,
                {
                  day: "numeric",
                  month: "numeric",
                  year: "numeric",
                }
              )
            : "t"}
        </time>
      </div>
      <div className="build__weapons">
        {weapons.map((weaponSplId) => (
          <Image
            key={weaponSplId}
            path={weaponImageUrl(weaponSplId)}
            alt=""
            height={36}
            width={36}
          />
        ))}
      </div>
      <div className="build__gear-abilities">
        {/* xxx: extract this to component instead of duplicating */}
        <Image
          height={64}
          width={64}
          /* xxx: make ticket for this or fix */
          alt=""
          path={gearImageUrl("head", headGearSplId)}
          className="build__gear"
        />
        {abilities[0].map((ability, i) => (
          <Ability key={i} ability={ability} size={i === 0 ? "MAIN" : "SUB"} />
        ))}
        <Image
          height={64}
          width={64}
          /* xxx: make ticket for this or fix */
          alt=""
          path={gearImageUrl("clothes", clothesGearSplId)}
          className="build__gear"
        />
        {abilities[1].map((ability, i) => (
          <Ability key={i} ability={ability} size={i === 0 ? "MAIN" : "SUB"} />
        ))}
        <Image
          height={64}
          width={64}
          /* xxx: make ticket for this or fix */
          alt=""
          path={gearImageUrl("shoes", shoesGearSplId)}
          className="build__gear"
        />
        {abilities[2].map((ability, i) => (
          <Ability key={i} ability={ability} size={i === 0 ? "MAIN" : "SUB"} />
        ))}
      </div>
    </div>
  );
}
