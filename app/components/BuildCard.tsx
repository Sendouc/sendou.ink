import clsx from "clsx";
import { useTranslation } from "react-i18next";
import type { AllAbilitiesTuple } from "~/db/models/builds/queries.server";
import type { Build, BuildWeapon } from "~/db/types";
import { useIsMounted } from "~/hooks/useIsMounted";
import type {
  Ability as AbilityType,
  GearType,
  ModeShort,
} from "~/modules/in-game-lists";
import { databaseTimestampToDate } from "~/utils/dates";
import { gearImageUrl, modeImageUrl, weaponImageUrl } from "~/utils/urls";
import { Ability } from "./Ability";
import { LinkButton } from "./Button";
import { Image } from "./Image";
import { Popover } from "./Popover";

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
  canEdit?: boolean;
};

export function BuildCard({
  title,
  description,
  weapons,
  updatedAt,
  headGearSplId,
  clothesGearSplId,
  shoesGearSplId,
  abilities,
  modes,
  canEdit = false,
}: BuildProps) {
  const { t } = useTranslation(["weapons", "builds"]);
  const { i18n } = useTranslation();
  const isMounted = useIsMounted();

  const bottomRowItems = [
    description && (
      <Popover
        key="info"
        trigger={<>{t("builds:buildCard.info")}</>}
        triggerClassName="build__small-text"
      >
        {description}
      </Popover>
    ),
    canEdit && (
      <LinkButton
        key="edit"
        className="build__small-text"
        variant="minimal"
        tiny
        to="/"
      >
        {t("builds:buildCard.edit")}
      </LinkButton>
    ),
  ].filter(Boolean);

  return (
    <div className="build">
      <div>
        <div className="build__top-row">
          <h2 className="build__title">{title}</h2>
          {modes && modes.length > 0 && (
            <div className="build__modes">
              {modes.map((mode) => (
                <Image
                  key={mode}
                  // xxx: alt to translated name + title
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
          <div key={weaponSplId} className="build__weapon">
            <Image
              path={weaponImageUrl(weaponSplId)}
              alt={t(`weapons:${weaponSplId}` as any)}
              title={t(`weapons:${weaponSplId}` as any)}
              height={36}
              width={36}
            />
          </div>
        ))}
        {weapons.length === 1 && (
          <div className="build__weapon-text">
            {t(`weapons:${weapons[0]!}` as any)}
          </div>
        )}
      </div>
      <div className="build__gear-abilities">
        <AbilitiesRowWithGear
          gearType="head"
          abilities={abilities[0]}
          gearId={headGearSplId}
        />
        <AbilitiesRowWithGear
          gearType="clothes"
          abilities={abilities[1]}
          gearId={clothesGearSplId}
        />
        <AbilitiesRowWithGear
          gearType="shoes"
          abilities={abilities[2]}
          gearId={shoesGearSplId}
        />
      </div>
      {bottomRowItems.length > 0 && (
        <div className="build__bottom-row">{bottomRowItems}</div>
      )}
    </div>
  );
}

function AbilitiesRowWithGear({
  gearType,
  abilities,
  gearId,
}: {
  gearType: GearType;
  abilities: AbilityType[];
  gearId: number;
}) {
  return (
    <>
      <Image
        height={64}
        width={64}
        alt=""
        path={gearImageUrl(gearType, gearId)}
        className="build__gear"
      />
      {abilities.map((ability, i) => (
        <Ability key={i} ability={ability} size={i === 0 ? "MAIN" : "SUB"} />
      ))}
    </>
  );
}
