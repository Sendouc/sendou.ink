import clsx from "clsx";
import { useTranslation } from "~/hooks/useTranslation";
import { Link } from "react-router-dom";
import type { Build, BuildWeapon, GearType, User } from "~/db/types";
import { useIsMounted } from "~/hooks/useIsMounted";
import { useUser } from "~/modules/auth";
import type {
  Ability as AbilityType,
  ModeShort,
} from "~/modules/in-game-lists";
import type {
  BuildAbilitiesTuple,
  MainWeaponId,
} from "~/modules/in-game-lists/types";
import { databaseTimestampToDate } from "~/utils/dates";
import { discordFullName, gearTypeToInitial } from "~/utils/strings";
import {
  analyzerPage,
  gearImageUrl,
  mainWeaponImageUrl,
  modeImageUrl,
  mySlugify,
  navIconUrl,
  userBuildsPage,
  weaponBuildPage,
} from "~/utils/urls";
import { Ability } from "./Ability";
import { Button, LinkButton } from "./Button";
import { FormWithConfirm } from "./FormWithConfirm";
import { TrashIcon } from "./icons/Trash";
import { EditIcon } from "./icons/Edit";
import { Image } from "./Image";
import { Popover } from "./Popover";
import { InfoIcon } from "./icons/Info";

interface BuildProps {
  build: Pick<
    Build,
    | "id"
    | "title"
    | "description"
    | "clothesGearSplId"
    | "headGearSplId"
    | "shoesGearSplId"
    | "updatedAt"
  > & {
    abilities: BuildAbilitiesTuple;
    modes: ModeShort[] | null;
    weapons: Array<BuildWeapon["weaponSplId"]>;
  };
  owner?: Pick<User, "discordId" | "discordDiscriminator" | "discordName">;
  canEdit?: boolean;
}

export function BuildCard({ build, owner, canEdit = false }: BuildProps) {
  const user = useUser();
  const { t } = useTranslation(["weapons", "builds", "common", "game-misc"]);
  const { i18n } = useTranslation();
  const isMounted = useIsMounted();

  const {
    id,
    title,
    description,
    clothesGearSplId,
    headGearSplId,
    shoesGearSplId,
    updatedAt,
    abilities,
    modes,
    weapons,
  } = build;

  return (
    <div className="build">
      <div>
        <div className="build__top-row">
          {modes && modes.length > 0 && (
            <div className="build__modes">
              {modes.map((mode) => (
                <Image
                  key={mode}
                  alt={t(`game-misc:MODE_LONG_${mode}` as any)}
                  title={t(`game-misc:MODE_LONG_${mode}` as any)}
                  path={modeImageUrl(mode)}
                  width={18}
                  height={18}
                />
              ))}
            </div>
          )}
          <h2 className="build__title">{title}</h2>
        </div>
        <div className="build__date-author-row">
          {owner && (
            <>
              <Link to={userBuildsPage(owner)}>{discordFullName(owner)}</Link>
              <div>•</div>
            </>
          )}
          <time className={clsx({ invisible: !isMounted })}>
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
      </div>
      <div className="build__weapons">
        {weapons.map((weaponSplId) => (
          <RoundWeaponImage key={weaponSplId} weaponSplId={weaponSplId} />
        ))}
        {weapons.length === 1 && (
          <div className="build__weapon-text">
            {t(`weapons:MAIN_${weapons[0]!}` as any)}
          </div>
        )}
      </div>
      <div className="build__gear-abilities">
        <AbilitiesRowWithGear
          gearType="HEAD"
          abilities={abilities[0]}
          gearId={headGearSplId}
        />
        <AbilitiesRowWithGear
          gearType="CLOTHES"
          abilities={abilities[1]}
          gearId={clothesGearSplId}
        />
        <AbilitiesRowWithGear
          gearType="SHOES"
          abilities={abilities[2]}
          gearId={shoesGearSplId}
        />
      </div>
      <div className="build__bottom-row">
        <Link
          to={analyzerPage({
            weaponId: weapons[0]!,
            abilities: abilities.flat(),
          })}
        >
          <Image
            alt={t("common:pages.analyzer")}
            className="build__icon"
            path={navIconUrl("analyzer")}
          />
        </Link>
        {description ? (
          <Popover
            buttonChildren={<InfoIcon className="build__icon" />}
            triggerClassName="minimal tiny build__small-text"
          >
            {description}
          </Popover>
        ) : null}
        {canEdit && (
          <>
            <LinkButton
              className="build__small-text"
              variant="minimal"
              tiny
              to={`new?buildId=${id}&userId=${user!.id}`}
            >
              <EditIcon className="build__icon" />
            </LinkButton>
            <FormWithConfirm
              dialogHeading={t("builds:deleteConfirm", { title })}
              fields={[["buildToDeleteId", id]]}
            >
              <Button
                className="build__small-text"
                variant="minimal-destructive"
                tiny
                type="submit"
              >
                <TrashIcon className="build__icon" />
              </Button>
            </FormWithConfirm>
          </>
        )}
      </div>
    </div>
  );
}

function RoundWeaponImage({ weaponSplId }: { weaponSplId: MainWeaponId }) {
  const { t } = useTranslation(["weapons"]);
  const slug = mySlugify(t(`weapons:MAIN_${weaponSplId}`, { lng: "en" }));

  return (
    <div key={weaponSplId} className="build__weapon">
      <Link to={weaponBuildPage(slug)}>
        <Image
          path={mainWeaponImageUrl(weaponSplId)}
          alt={t(`weapons:MAIN_${weaponSplId}` as any)}
          title={t(`weapons:MAIN_${weaponSplId}` as any)}
          height={36}
          width={36}
        />
      </Link>
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
  const { t } = useTranslation(["gear"]);
  const translatedGearName = t(
    `gear:${gearTypeToInitial(gearType)}_${gearId}` as any
  );

  return (
    <>
      <Image
        height={64}
        width={64}
        alt={translatedGearName}
        title={translatedGearName}
        path={gearImageUrl(gearType, gearId)}
        className="build__gear"
      />
      {abilities.map((ability, i) => (
        <Ability key={i} ability={ability} size={i === 0 ? "MAIN" : "SUB"} />
      ))}
    </>
  );
}
