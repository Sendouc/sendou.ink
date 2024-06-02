import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type {
  Build,
  BuildWeapon,
  GearType,
  UserWithPlusTier,
} from "~/db/types";
import { useIsMounted } from "~/hooks/useIsMounted";
import { useUser } from "~/features/auth/core/user";
import type {
  Ability as AbilityType,
  ModeShort,
} from "~/modules/in-game-lists";
import type { BuildAbilitiesTuple } from "~/modules/in-game-lists/types";
import { databaseTimestampToDate } from "~/utils/dates";
import { gearTypeToInitial } from "~/utils/strings";
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
import { LockIcon } from "./icons/Lock";
import type { BuildWeaponWithTop500Info } from "~/features/builds";
import { altWeaponIdToId } from "~/modules/in-game-lists/weapon-ids";

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
    | "private"
  > & {
    abilities: BuildAbilitiesTuple;
    modes: ModeShort[] | null;
    weapons: Array<{
      weaponSplId: BuildWeapon["weaponSplId"];
      minRank: number | null;
      maxPower: number | null;
    }>;
  };
  owner?: Pick<
    UserWithPlusTier,
    "discordId" | "username" | "discordDiscriminator" | "plusTier"
  >;
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
    <div
      className={clsx("build", { build__private: build.private })}
      data-testid="build-card"
    >
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
                  testId={`build-mode-${mode}`}
                />
              ))}
            </div>
          )}
          <h2 className="build__title" data-testid="build-title">
            {title}
          </h2>
        </div>
        <div className="build__date-author-row">
          {owner && (
            <>
              <Link
                to={userBuildsPage(owner)}
                className="build__date-author-row__owner"
              >
                {owner.username}
              </Link>
              <div>•</div>
            </>
          )}
          {owner?.plusTier ? (
            <>
              <span>+{owner.plusTier}</span>
              <div>•</div>
            </>
          ) : null}
          <div className="stack horizontal sm">
            {build.private ? (
              <div className="build__private-text">
                <LockIcon className="build__private-icon" />{" "}
                {t("common:build.private")}
              </div>
            ) : null}
            <time
              className={clsx("whitespace-nowrap", { invisible: !isMounted })}
            >
              {isMounted
                ? databaseTimestampToDate(updatedAt).toLocaleDateString(
                    i18n.language,
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    },
                  )
                : "t"}
            </time>
          </div>
        </div>
      </div>
      <div className="build__weapons">
        {weapons.map((weapon) => (
          <RoundWeaponImage key={weapon.weaponSplId} weapon={weapon} />
        ))}
        {weapons.length === 1 && (
          <div className="build__weapon-text">
            {t(`weapons:MAIN_${weapons[0].weaponSplId}` as any)}
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
            weaponId: weapons[0].weaponSplId,
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
              size="tiny"
              to={`new?buildId=${id}&userId=${user!.id}`}
              testId="edit-build"
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
                size="tiny"
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

function RoundWeaponImage({ weapon }: { weapon: BuildWeaponWithTop500Info }) {
  const { weaponSplId, maxPower, minRank } = weapon;
  const normalizedWeaponSplId = altWeaponIdToId.get(weaponSplId) ?? weaponSplId;

  const { t } = useTranslation(["weapons"]);
  const slug = mySlugify(
    t(`weapons:MAIN_${normalizedWeaponSplId}`, { lng: "en" }),
  );

  const isTop500 = typeof maxPower === "number" && typeof minRank === "number";

  return (
    <div key={weaponSplId} className="build__weapon">
      {isTop500 ? (
        <Image
          className="build__top500"
          path={navIconUrl("xsearch")}
          alt=""
          title={`Max X Power: ${maxPower} | Best Rank: ${minRank}`}
          height={24}
          width={24}
          testId="top500-crown"
        />
      ) : null}
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
    `gear:${gearTypeToInitial(gearType)}_${gearId}` as any,
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
