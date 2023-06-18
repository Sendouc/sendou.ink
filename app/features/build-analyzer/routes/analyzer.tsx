import { type LinksFunction, type V2_MetaFunction } from "@remix-run/node";
import type { ShouldRevalidateFunction } from "@remix-run/react";
import { Link } from "@remix-run/react";
import * as React from "react";
import { useTranslation } from "~/hooks/useTranslation";
import { AbilitiesSelector } from "~/components/AbilitiesSelector";
import { Ability } from "~/components/Ability";
import { WeaponCombobox } from "~/components/Combobox";
import { Image } from "~/components/Image";
import { Main } from "~/components/Main";
import { Popover } from "~/components/Popover";
import { Toggle } from "~/components/Toggle";
import { useSetTitle } from "~/hooks/useSetTitle";
import {
  ANGLE_SHOOTER_ID,
  INK_MINE_ID,
  INK_STORM_ID,
  isAbility,
  POINT_SENSOR_ID,
  TOXIC_MIST_ID,
  TORPEDO_ID,
  type BuildAbilitiesTupleWithUnknown,
  type MainWeaponId,
  type SubWeaponId,
  abilitiesShort,
} from "~/modules/in-game-lists";
import styles from "../analyzer.css";
import { damageTypeTranslationString } from "~/utils/i18next";
import { type SendouRouteHandle } from "~/utils/remix";
import { makeTitle } from "~/utils/strings";
import {
  ANALYZER_URL,
  mainWeaponImageUrl,
  navIconUrl,
  objectDamageCalculatorPage,
  specialWeaponImageUrl,
  subWeaponImageUrl,
  userNewBuildPage,
} from "~/utils/urls";
import clsx from "clsx";
import {
  ABILITIES_WITHOUT_CHUNKS,
  getAbilityChunksMapAsArray,
} from "../core/abilityChunksCalc";
import type {
  AbilityPoints,
  AnalyzedBuild,
  SpecialEffectType,
  Stat,
} from "../analyzer-types";
import {
  lastDitchEffortIntensityToAp,
  SPECIAL_EFFECTS,
} from "../core/specialEffects";
import {
  damageTypeToWeaponType,
  MAX_LDE_INTENSITY,
} from "../analyzer-constants";
import { useAnalyzeBuild } from "../analyzer-hooks";
import { Tabs, Tab } from "~/components/Tabs";
import {
  buildIsEmpty,
  damageIsSubWeaponDamage,
  isStackableAbility,
} from "../core/utils";
import { useUser } from "~/modules/auth";
import { atOrError } from "~/utils/arrays";

export const CURRENT_PATCH = "4.0";

export const meta: V2_MetaFunction = () => {
  return [
    { title: makeTitle("Build Analyzer") },
    {
      name: "description",
      content: "Detailed stats for any weapon and build in Splatoon 3.",
    },
  ];
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const handle: SendouRouteHandle = {
  i18n: ["weapons", "analyzer", "builds"],
  breadcrumb: () => ({
    imgPath: navIconUrl("analyzer"),
    href: ANALYZER_URL,
    type: "IMAGE",
  }),
};

// Resolves this Github issue: https://github.com/Sendouc/sendou.ink/issues/1053
export const shouldRevalidate: ShouldRevalidateFunction = () => false;

export default function BuildAnalyzerPage() {
  const user = useUser();
  const { t } = useTranslation(["analyzer", "common", "weapons"]);
  useSetTitle(t("common:pages.analyzer"));
  const {
    build,
    build2,
    focusedBuild,
    mainWeaponId,
    handleChange,
    analyzed,
    analyzed2,
    focused,
    abilityPoints,
    abilityPoints2,
    ldeIntensity,
    allEffects,
  } = useAnalyzeBuild();

  const statKeyToTuple = (key: keyof AnalyzedBuild["stats"]) => {
    return [analyzed.stats[key], analyzed2.stats[key]] as [Stat, Stat];
  };

  const objectShredderSelected = build[2][0] === "OS" || build2[2][0] === "OS";

  const isComparing = !buildIsEmpty(build) && !buildIsEmpty(build2);

  const mainWeaponCategoryItems = [
    analyzed.stats.shotSpreadAir && (
      <StatCard
        isComparing={isComparing}
        abilityPoints={abilityPoints}
        key="jumpShotSpread"
        stat={statKeyToTuple("shotSpreadAir")}
        title={t("analyzer:stat.jumpShotSpread")}
        suffix="°"
      />
    ),
    typeof analyzed.stats.shotSpreadGround === "number" && (
      <StatCard
        isComparing={isComparing}
        abilityPoints={abilityPoints}
        key="groundShotSpread"
        stat={analyzed.stats.shotSpreadGround}
        title={t("analyzer:stat.groundShotSpread")}
        suffix="°"
      />
    ),
    typeof analyzed.stats.mainWeaponWhiteInkSeconds === "number" && (
      <StatCard
        isComparing={isComparing}
        abilityPoints={abilityPoints}
        key="whiteInkSeconds"
        stat={analyzed.stats.mainWeaponWhiteInkSeconds}
        title={t("analyzer:stat.whiteInk")}
        suffix={t("analyzer:suffix.seconds")}
      />
    ),
    typeof analyzed.weapon.brellaCanopyHp === "number" && (
      <StatCard
        isComparing={isComparing}
        abilityPoints={abilityPoints}
        key="brellaCanopyHp"
        stat={analyzed.weapon.brellaCanopyHp}
        title={t("analyzer:stat.canopyHp")}
        suffix={t("analyzer:suffix.hp")}
      />
    ),
    typeof analyzed.weapon.fullChargeSeconds === "number" && (
      <StatCard
        isComparing={isComparing}
        abilityPoints={abilityPoints}
        key="fullChargeSeconds"
        stat={analyzed.weapon.fullChargeSeconds}
        title={t("analyzer:stat.fullChargeSeconds")}
        suffix={t("analyzer:suffix.seconds")}
      />
    ),
    typeof analyzed.weapon.maxChargeHoldSeconds === "number" && (
      <StatCard
        isComparing={isComparing}
        abilityPoints={abilityPoints}
        key="maxChargeHoldSeconds"
        stat={analyzed.weapon.maxChargeHoldSeconds}
        title={t("analyzer:stat.maxChargeHoldSeconds")}
        suffix={t("analyzer:suffix.seconds")}
      />
    ),
  ].filter(Boolean);

  // Handles edge case where a primary slot-only ability (e.g. Ninja Squid) is selected & the 'abilityPoints' count is still 0,
  //  and also fixes an edge case with Ability Doubler as the only ability in the build
  const showAbilityChunksRequired: boolean = build.some(
    (gear) =>
      gear.filter((ability) => !ABILITIES_WITHOUT_CHUNKS.has(ability)).length
  );

  return (
    <Main>
      <div className="analyzer__container">
        <div className="analyzer__left-column">
          <div className="stack sm items-center w-full">
            <div className="w-full">
              <WeaponCombobox
                inputName="weapon"
                onChange={(opt) =>
                  opt &&
                  handleChange({
                    newMainWeaponId: Number(opt.value) as MainWeaponId,
                  })
                }
                fullWidth
              />
            </div>
          </div>
          <div className="stack md items-center w-full">
            <div className="w-full">
              <Tabs className="analyzer__sub-nav" compact>
                <Tab
                  active={focused === 1}
                  onClick={() => handleChange({ newFocused: 1 })}
                  testId="build1-tab"
                >
                  {t("analyzer:build1")}
                </Tab>
                <Tab
                  active={focused === 2}
                  onClick={() => handleChange({ newFocused: 2 })}
                  testId="build2-tab"
                >
                  {t("analyzer:build2")}
                </Tab>
                <Tab
                  active={focused === 3}
                  onClick={() => handleChange({ newFocused: 3 })}
                  testId="ap-tab"
                >
                  {t("analyzer:compare")}
                </Tab>
              </Tabs>
              {focusedBuild ? (
                <AbilitiesSelector
                  selectedAbilities={focusedBuild}
                  onChange={(newBuild) => {
                    const firstBuildIsEmpty = build
                      .flat()
                      .every((ability) => ability === "UNKNOWN");

                    const buildWasEmptied =
                      !firstBuildIsEmpty &&
                      newBuild
                        .flat()
                        .every((ability) => ability === "UNKNOWN") &&
                      focused === 1;

                    // if we don't do this the
                    // build2 would be duplicated
                    if (buildWasEmptied) {
                      handleChange({
                        newBuild: build2,
                        newBuild2: newBuild,
                        newFocused: 1,
                      });
                      return;
                    }

                    handleChange({
                      [focused === 1 || firstBuildIsEmpty
                        ? "newBuild"
                        : "newBuild2"]: newBuild,
                      newFocused: firstBuildIsEmpty ? 1 : undefined,
                    });
                  }}
                />
              ) : (
                <APCompare
                  abilityPoints={abilityPoints}
                  abilityPoints2={abilityPoints2}
                  build={build}
                  build2={build2}
                />
              )}
            </div>
            <EffectsSelector
              build={build}
              build2={build2}
              ldeIntensity={ldeIntensity}
              handleLdeIntensityChange={(newLdeIntensity) =>
                handleChange({ newLdeIntensity })
              }
              handleAddEffect={(newEffect) =>
                handleChange({ newEffects: [...allEffects, newEffect] })
              }
              handleRemoveEffect={(effectToRemove) =>
                handleChange({
                  newEffects: allEffects.filter((e) => e !== effectToRemove),
                })
              }
              effects={allEffects}
            />
            {showAbilityChunksRequired && (
              <AbilityChunksRequired build={build} />
            )}
          </div>
          <div className="analyzer__patch">
            {t("analyzer:patch")} {CURRENT_PATCH}
          </div>
        </div>
        <div className="stack md">
          {mainWeaponCategoryItems.length > 0 && (
            <StatCategory
              title={t("analyzer:stat.category.main")}
              summaryRightContent={
                <div className="analyzer__weapon-info-badge">
                  <Image
                    path={mainWeaponImageUrl(mainWeaponId)}
                    width={20}
                    height={20}
                    alt={t(`weapons:MAIN_${mainWeaponId}`)}
                  />
                  {t(`weapons:MAIN_${mainWeaponId}`)}
                </div>
              }
            >
              {mainWeaponCategoryItems}
            </StatCategory>
          )}

          <StatCategory
            title={t("analyzer:stat.category.sub")}
            summaryRightContent={
              <div className="analyzer__weapon-info-badge">
                <Image
                  path={subWeaponImageUrl(analyzed.weapon.subWeaponSplId)}
                  width={20}
                  height={20}
                  alt={t(`weapons:SUB_${analyzed.weapon.subWeaponSplId}`)}
                />
                {t(`weapons:SUB_${analyzed.weapon.subWeaponSplId}`)}
              </div>
            }
          >
            <StatCard
              isComparing={isComparing}
              abilityPoints={abilityPoints}
              stat={statKeyToTuple("subWeaponInkConsumptionPercentage")}
              title={t("analyzer:stat.subWeaponInkConsumptionPercentage")}
              suffix="%"
            />
            <StatCard
              isComparing={isComparing}
              abilityPoints={abilityPoints}
              stat={analyzed.stats.subWeaponWhiteInkSeconds}
              title={t("analyzer:stat.whiteInk")}
              suffix={t("analyzer:suffix.seconds")}
            />
            {analyzed.stats.subVelocity && (
              <StatCard
                isComparing={isComparing}
                abilityPoints={abilityPoints}
                stat={statKeyToTuple("subVelocity")}
                title={t("analyzer:stat.sub.velocity")}
              />
            )}
            {analyzed.stats.subFirstPhaseDuration && (
              <StatCard
                isComparing={isComparing}
                abilityPoints={abilityPoints}
                stat={statKeyToTuple("subFirstPhaseDuration")}
                title={t("analyzer:stat.sub.firstPhaseDuration")}
                suffix={t("analyzer:suffix.seconds")}
              />
            )}
            {analyzed.stats.subSecondPhaseDuration && (
              <StatCard
                isComparing={isComparing}
                abilityPoints={abilityPoints}
                stat={statKeyToTuple("subSecondPhaseDuration")}
                title={t("analyzer:stat.sub.secondPhaseDuration")}
                suffix={t("analyzer:suffix.seconds")}
              />
            )}
            {analyzed.stats.subMarkingTimeInSeconds && (
              <StatCard
                isComparing={isComparing}
                abilityPoints={abilityPoints}
                stat={statKeyToTuple("subMarkingTimeInSeconds")}
                title={t("analyzer:stat.sub.markingTimeInSeconds")}
                suffix={t("analyzer:suffix.seconds")}
              />
            )}
            {analyzed.stats.subMarkingRadius && (
              <StatCard
                isComparing={isComparing}
                abilityPoints={abilityPoints}
                stat={statKeyToTuple("subMarkingRadius")}
                title={t("analyzer:stat.sub.markingRadius")}
              />
            )}
            {analyzed.stats.subExplosionRadius && (
              <StatCard
                isComparing={isComparing}
                abilityPoints={abilityPoints}
                stat={statKeyToTuple("subExplosionRadius")}
                title={t("analyzer:stat.sub.explosionRadius")}
              />
            )}
            {analyzed.stats.subHp && (
              <StatCard
                isComparing={isComparing}
                abilityPoints={abilityPoints}
                stat={statKeyToTuple("subHp")}
                title={t("analyzer:stat.sub.hp")}
                suffix={t("analyzer:suffix.hp")}
              />
            )}
            {analyzed.stats.subQsjBoost && (
              <StatCard
                isComparing={isComparing}
                abilityPoints={abilityPoints}
                stat={statKeyToTuple("subQsjBoost")}
                title={t("analyzer:stat.sub.qsjBoost")}
                suffix={t("analyzer:abilityPoints.short")}
              />
            )}
          </StatCategory>

          <StatCategory
            title={t("analyzer:stat.category.special")}
            summaryRightContent={
              <div className="analyzer__weapon-info-badge">
                <Image
                  path={specialWeaponImageUrl(
                    analyzed.weapon.specialWeaponSplId
                  )}
                  width={20}
                  height={20}
                  alt={t(
                    `weapons:SPECIAL_${analyzed.weapon.specialWeaponSplId}`
                  )}
                />
                {t(`weapons:SPECIAL_${analyzed.weapon.specialWeaponSplId}`)}
              </div>
            }
          >
            <StatCard
              isComparing={isComparing}
              abilityPoints={abilityPoints}
              stat={statKeyToTuple("specialPoint")}
              title={t("analyzer:stat.specialPoints")}
              suffix={t("analyzer:suffix.specialPointsShort")}
            />
            <StatCard
              isComparing={isComparing}
              abilityPoints={abilityPoints}
              stat={statKeyToTuple("specialLost")}
              title={t("analyzer:stat.specialLost")}
              suffix="%"
            />
            <StatCard
              isComparing={isComparing}
              abilityPoints={abilityPoints}
              stat={statKeyToTuple("specialLostSplattedByRP")}
              title={t("analyzer:stat.specialLostSplattedByRP")}
              suffix="%"
            />
            {analyzed.stats.specialDurationInSeconds && (
              <StatCard
                isComparing={isComparing}
                abilityPoints={abilityPoints}
                stat={statKeyToTuple("specialDurationInSeconds")}
                title={t("analyzer:stat.special.duration", {
                  weapon: t(
                    `weapons:SPECIAL_${analyzed.weapon.specialWeaponSplId}`
                  ),
                })}
                suffix={t("analyzer:suffix.seconds")}
                popoverInfo={
                  analyzed.weapon.specialWeaponSplId === INK_STORM_ID
                    ? t("analyzer:stat.special.duration.inkStormExplanation")
                    : undefined
                }
              />
            )}
            {analyzed.stats.specialDamageDistance && (
              <StatCard
                isComparing={isComparing}
                abilityPoints={abilityPoints}
                stat={statKeyToTuple("specialDamageDistance")}
                title={t("analyzer:stat.special.damageDistance", {
                  weapon: t(
                    `weapons:SPECIAL_${analyzed.weapon.specialWeaponSplId}`
                  ),
                })}
              />
            )}
            {analyzed.stats.specialPaintRadius && (
              <StatCard
                isComparing={isComparing}
                abilityPoints={abilityPoints}
                stat={statKeyToTuple("specialPaintRadius")}
                title={t("analyzer:stat.special.paintRadius", {
                  weapon: t(
                    `weapons:SPECIAL_${analyzed.weapon.specialWeaponSplId}`
                  ),
                })}
              />
            )}
            {analyzed.stats.specialFieldHp && (
              <StatCard
                isComparing={isComparing}
                abilityPoints={abilityPoints}
                stat={statKeyToTuple("specialFieldHp")}
                title={t("analyzer:stat.special.shieldHp", {
                  weapon: t(
                    `weapons:SPECIAL_${analyzed.weapon.specialWeaponSplId}`
                  ),
                })}
                suffix={t("analyzer:suffix.hp")}
              />
            )}
            {analyzed.stats.specialDeviceHp && (
              <StatCard
                isComparing={isComparing}
                abilityPoints={abilityPoints}
                stat={statKeyToTuple("specialDeviceHp")}
                title={t("analyzer:stat.special.deviceHp", {
                  weapon: t(
                    `weapons:SPECIAL_${analyzed.weapon.specialWeaponSplId}`
                  ),
                })}
                suffix={t("analyzer:suffix.hp")}
              />
            )}
            {analyzed.stats.specialHookInkConsumptionPercentage && (
              <StatCard
                isComparing={isComparing}
                abilityPoints={abilityPoints}
                stat={statKeyToTuple("specialHookInkConsumptionPercentage")}
                title={t("analyzer:stat.special.inkConsumptionHook", {
                  weapon: t(
                    `weapons:SPECIAL_${analyzed.weapon.specialWeaponSplId}`
                  ),
                })}
                suffix="%"
              />
            )}
            {analyzed.stats.specialInkConsumptionPerSecondPercentage && (
              <StatCard
                isComparing={isComparing}
                abilityPoints={abilityPoints}
                stat={statKeyToTuple(
                  "specialInkConsumptionPerSecondPercentage"
                )}
                title={t("analyzer:stat.special.inkConsumptionPerSecond", {
                  weapon: t(
                    `weapons:SPECIAL_${analyzed.weapon.specialWeaponSplId}`
                  ),
                })}
                suffix="%"
              />
            )}
            {analyzed.stats.specialReticleRadius && (
              <StatCard
                isComparing={isComparing}
                abilityPoints={abilityPoints}
                stat={statKeyToTuple("specialReticleRadius")}
                title={t("analyzer:stat.special.reticleRadius", {
                  weapon: t(
                    `weapons:SPECIAL_${analyzed.weapon.specialWeaponSplId}`
                  ),
                })}
              />
            )}
            {analyzed.stats.specialThrowDistance && (
              <StatCard
                isComparing={isComparing}
                abilityPoints={abilityPoints}
                stat={statKeyToTuple("specialThrowDistance")}
                title={t("analyzer:stat.special.throwDistance", {
                  weapon: t(
                    `weapons:SPECIAL_${analyzed.weapon.specialWeaponSplId}`
                  ),
                })}
              />
            )}
            {analyzed.stats.specialAutoChargeRate && (
              <StatCard
                isComparing={isComparing}
                abilityPoints={abilityPoints}
                stat={statKeyToTuple("specialAutoChargeRate")}
                title={t("analyzer:stat.special.autoChargeRate", {
                  weapon: t(
                    `weapons:SPECIAL_${analyzed.weapon.specialWeaponSplId}`
                  ),
                })}
              />
            )}
            {analyzed.stats.specialMaxRadius && (
              <StatCard
                isComparing={isComparing}
                abilityPoints={abilityPoints}
                stat={statKeyToTuple("specialMaxRadius")}
                title={t("analyzer:stat.special.maxRadius", {
                  weapon: t(
                    `weapons:SPECIAL_${analyzed.weapon.specialWeaponSplId}`
                  ),
                })}
                popoverInfo={t("analyzer:stat.special.maxRadius.explanation")}
              />
            )}
            {analyzed.stats.specialRadiusRange && (
              <StatCard
                isComparing={isComparing}
                abilityPoints={abilityPoints}
                stat={statKeyToTuple("specialRadiusRange")}
                title={t("analyzer:stat.special.radiusRange", {
                  weapon: t(
                    `weapons:SPECIAL_${analyzed.weapon.specialWeaponSplId}`
                  ),
                })}
              />
            )}
            {analyzed.stats.specialPowerUpDuration && (
              <StatCard
                isComparing={isComparing}
                abilityPoints={abilityPoints}
                stat={statKeyToTuple("specialPowerUpDuration")}
                title={t("analyzer:stat.special.powerUpDuration", {
                  weapon: t(
                    `weapons:SPECIAL_${analyzed.weapon.specialWeaponSplId}`
                  ),
                })}
                suffix={t("analyzer:suffix.seconds")}
              />
            )}
          </StatCategory>
          <StatCategory
            title={t("analyzer:stat.category.subDef")}
            textBelow={t("analyzer:trackingSubDefExplanation")}
          >
            <StatCard
              isComparing={isComparing}
              abilityPoints={abilityPoints}
              stat={statKeyToTuple("subDefToxicMistMovementReduction")}
              title={t("analyzer:stat.movementReduction", {
                weapon: t(`weapons:SUB_${TOXIC_MIST_ID}`),
              })}
              suffix="%"
            />
            <StatCard
              isComparing={isComparing}
              abilityPoints={abilityPoints}
              stat={statKeyToTuple("subDefPointSensorMarkedTimeInSeconds")}
              title={t("analyzer:stat.markedTime", {
                weapon: t(`weapons:SUB_${POINT_SENSOR_ID}`),
              })}
              suffix={t("analyzer:suffix.seconds")}
            />
            <StatCard
              isComparing={isComparing}
              abilityPoints={abilityPoints}
              stat={statKeyToTuple("subDefInkMineMarkedTimeInSeconds")}
              title={t("analyzer:stat.markedTime", {
                weapon: t(`weapons:SUB_${INK_MINE_ID}`),
              })}
              suffix={t("analyzer:suffix.seconds")}
            />
            <StatCard
              isComparing={isComparing}
              abilityPoints={abilityPoints}
              stat={statKeyToTuple("subDefAngleShooterMarkedTimeInSeconds")}
              title={t("analyzer:stat.markedTime", {
                weapon: t(`weapons:SUB_${ANGLE_SHOOTER_ID}`),
              })}
              suffix={t("analyzer:suffix.seconds")}
            />
          </StatCategory>

          {analyzed.stats.subWeaponDefenseDamages.length > 0 && (
            <StatCategory
              title={t("analyzer:stat.category.subWeaponDefenseDamages")}
              containerClassName="analyzer__table-container"
              textBelow={t("analyzer:damageSubDefExplanation")}
            >
              {(["SRU"] as const).some(
                (ability) => (abilityPoints.get(ability) ?? 0) > 0
              ) ? (
                <div className="analyzer__stat-card-highlighted" />
              ) : null}
              <DamageTable
                values={analyzed.stats.subWeaponDefenseDamages}
                multiShots={analyzed.weapon.multiShots}
              />
            </StatCategory>
          )}

          {analyzed.stats.damages.length > 0 && (
            <StatCategory
              title={t("analyzer:stat.category.damage")}
              containerClassName="analyzer__table-container"
            >
              <DamageTable
                values={analyzed.stats.damages}
                multiShots={analyzed.weapon.multiShots}
              />
            </StatCategory>
          )}

          {analyzed.stats.fullInkTankOptions.length > 0 && (
            <StatCategory
              title={t("analyzer:stat.category.actionsPerInkTank")}
              containerClassName="analyzer__table-container"
            >
              {(["ISM", "ISS"] as const).some(
                (ability) => (abilityPoints.get(ability) ?? 0) > 0
              ) ? (
                <div className="analyzer__stat-card-highlighted" />
              ) : null}
              <ConsumptionTable
                isComparing={isComparing}
                options={[
                  analyzed.stats.fullInkTankOptions,
                  analyzed2.stats.fullInkTankOptions,
                ]}
                subWeaponId={analyzed.weapon.subWeaponSplId}
              />
            </StatCategory>
          )}

          <StatCategory
            title={t("analyzer:stat.category.movement")}
            testId="movement-category"
          >
            <StatCard
              isComparing={isComparing}
              title={t("analyzer:attribute.weight")}
              abilityPoints={abilityPoints}
              stat={t(`analyzer:attribute.weight.${analyzed.weapon.speedType}`)}
            />
            <StatCard
              isComparing={isComparing}
              abilityPoints={abilityPoints}
              stat={statKeyToTuple("swimSpeed")}
              title={t("analyzer:stat.swimSpeed")}
              testId="swim-speed"
            />
            <StatCard
              isComparing={isComparing}
              abilityPoints={abilityPoints}
              stat={statKeyToTuple("swimSpeedHoldingRainmaker")}
              title={t("analyzer:stat.swimSpeedHoldingRainmaker")}
            />
            <StatCard
              isComparing={isComparing}
              abilityPoints={abilityPoints}
              stat={statKeyToTuple("runSpeed")}
              title={t("analyzer:stat.runSpeed")}
            />
            {analyzed.stats.shootingRunSpeed && (
              <StatCard
                isComparing={isComparing}
                abilityPoints={abilityPoints}
                stat={statKeyToTuple("shootingRunSpeed")}
                title={t("analyzer:stat.shootingRunSpeed")}
              />
            )}
            {analyzed.stats.shootingRunSpeedCharging && (
              <StatCard
                isComparing={isComparing}
                abilityPoints={abilityPoints}
                stat={statKeyToTuple("shootingRunSpeedCharging")}
                title={t("analyzer:stat.shootingRunSpeedCharging")}
              />
            )}
            {analyzed.stats.shootingRunSpeedFullCharge && (
              <StatCard
                isComparing={isComparing}
                abilityPoints={abilityPoints}
                stat={statKeyToTuple("shootingRunSpeedFullCharge")}
                title={t("analyzer:stat.shootingRunSpeedFullCharge")}
              />
            )}
            <StatCard
              isComparing={isComparing}
              abilityPoints={abilityPoints}
              stat={statKeyToTuple("squidSurgeChargeFrames")}
              title={t("analyzer:stat.squidSurgeChargeFrames")}
            />
            <StatCard
              isComparing={isComparing}
              abilityPoints={abilityPoints}
              stat={statKeyToTuple("runSpeedInEnemyInk")}
              title={t("analyzer:stat.runSpeedInEnemyInk")}
            />
            <StatCard
              isComparing={isComparing}
              abilityPoints={abilityPoints}
              stat={statKeyToTuple("framesBeforeTakingDamageInEnemyInk")}
              title={t("analyzer:stat.framesBeforeTakingDamageInEnemyInk")}
            />
            <StatCard
              isComparing={isComparing}
              abilityPoints={abilityPoints}
              stat={statKeyToTuple("damageTakenInEnemyInkPerSecond")}
              title={t("analyzer:stat.damageTakenInEnemyInkPerSecond")}
              suffix={t("analyzer:suffix.hp")}
            />
            <StatCard
              isComparing={isComparing}
              abilityPoints={abilityPoints}
              stat={statKeyToTuple("enemyInkDamageLimit")}
              title={t("analyzer:stat.enemyInkDamageLimit")}
              suffix={t("analyzer:suffix.hp")}
            />
          </StatCategory>

          <StatCategory title={t("analyzer:stat.category.misc")}>
            <StatCard
              isComparing={isComparing}
              abilityPoints={abilityPoints}
              stat={statKeyToTuple("squidFormInkRecoverySeconds")}
              title={t("analyzer:stat.squidFormInkRecoverySeconds")}
              suffix={t("analyzer:suffix.seconds")}
            />
            <StatCard
              isComparing={isComparing}
              abilityPoints={abilityPoints}
              stat={statKeyToTuple("humanoidFormInkRecoverySeconds")}
              title={t("analyzer:stat.humanoidFormInkRecoverySeconds")}
              suffix={t("analyzer:suffix.seconds")}
            />
            <StatCard
              isComparing={isComparing}
              abilityPoints={abilityPoints}
              stat={statKeyToTuple("quickRespawnTime")}
              title={t("analyzer:stat.quickRespawnTime")}
              suffix={t("analyzer:suffix.seconds")}
            />
            <StatCard
              isComparing={isComparing}
              abilityPoints={abilityPoints}
              stat={statKeyToTuple("quickRespawnTimeSplattedByRP")}
              title={t("analyzer:stat.quickRespawnTimeSplattedByRP")}
              suffix={t("analyzer:suffix.seconds")}
            />
            <StatCard
              isComparing={isComparing}
              abilityPoints={abilityPoints}
              stat={statKeyToTuple("superJumpTimeGroundFrames")}
              title={t("analyzer:stat.superJumpTimeGround")}
            />
            <StatCard
              isComparing={isComparing}
              abilityPoints={abilityPoints}
              stat={statKeyToTuple("superJumpTimeTotal")}
              title={t("analyzer:stat.superJumpTimeTotal")}
              suffix={t("analyzer:suffix.seconds")}
            />
          </StatCategory>
          {objectShredderSelected && (
            <Link
              className="analyzer__noticeable-link"
              to={objectDamageCalculatorPage(mainWeaponId)}
            >
              <Image
                path={navIconUrl("object-damage-calculator")}
                width={24}
                height={24}
                alt=""
              />
              {t("analyzer:objCalcAd")}
            </Link>
          )}
          {user && focusedBuild && !buildIsEmpty(focusedBuild) ? (
            <Link
              className="analyzer__noticeable-link"
              to={userNewBuildPage(user, {
                weapon: mainWeaponId,
                build: focusedBuild,
              })}
              data-testid="new-build-prompt"
            >
              <Image
                path={navIconUrl("builds")}
                width={24}
                height={24}
                alt=""
              />
              {t("analyzer:newBuildPrompt")}
            </Link>
          ) : null}
        </div>
      </div>
    </Main>
  );
}

function APCompare({
  abilityPoints,
  abilityPoints2,
  build,
  build2,
}: {
  abilityPoints: AbilityPoints;
  abilityPoints2: AbilityPoints;
  build: BuildAbilitiesTupleWithUnknown;
  build2: BuildAbilitiesTupleWithUnknown;
}) {
  const { t } = useTranslation(["analyzer"]);

  const buildMains = build
    .flat()
    .filter((ability) => !isStackableAbility(ability) && ability !== "UNKNOWN");
  const build2Mains = build2
    .flat()
    .filter((ability) => !isStackableAbility(ability) && ability !== "UNKNOWN");

  const hasAtLeastOneMainOnlyAbility =
    buildMains.length > 0 || build2Mains.length > 0;

  return (
    <div className="analyzer__ap-compare">
      {hasAtLeastOneMainOnlyAbility ? (
        <>
          <div className="analyzer__ap-compare__mains">
            {buildMains.map((ability) => (
              <Ability key={ability} ability={ability} size="TINY" />
            ))}
          </div>
          <div />
          <div className="analyzer__ap-compare__mains">
            {build2Mains.map((ability) => (
              <Ability key={ability} ability={ability} size="TINY" />
            ))}
          </div>
        </>
      ) : null}
      {([...abilitiesShort, "UNKNOWN"] as const).map((ability) => {
        const ap = abilityPoints.get(ability) ?? 0;
        const ap2 = abilityPoints2.get(ability) ?? 0;

        if (!ap && !ap2) return null;

        return (
          <React.Fragment key={ability}>
            <div
              className={clsx("justify-self-end", {
                invisible: !ap,
              })}
              data-testid="ap-compare-1"
            >
              {ap}
              {t("analyzer:abilityPoints.short")}
            </div>
            <div
              className={clsx("analyzer__ap-compare__bar", "justify-self-end", {
                analyzer__better: ap >= ap2,
              })}
              style={{ width: `${ap}px` }}
            />
            <Ability ability={ability} size="TINY" />
            <div
              className={clsx("analyzer__ap-compare__bar", {
                analyzer__better: ap <= ap2,
              })}
              style={{ width: `${ap2}px` }}
            />
            <div
              className={clsx({ invisible: !ap2 })}
              data-testid="ap-compare-2"
            >
              {ap2}
              {t("analyzer:abilityPoints.short")}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function EffectsSelector({
  build,
  build2,
  effects,
  ldeIntensity,
  handleLdeIntensityChange,
  handleAddEffect,
  handleRemoveEffect,
}: {
  build: BuildAbilitiesTupleWithUnknown;
  build2: BuildAbilitiesTupleWithUnknown;
  effects: Array<SpecialEffectType>;
  ldeIntensity: number;
  handleLdeIntensityChange: (newLdeIntensity: number) => void;
  handleAddEffect: (effect: SpecialEffectType) => void;
  handleRemoveEffect: (effect: SpecialEffectType) => void;
}) {
  const { t } = useTranslation(["weapons", "analyzer"]);

  const effectsToShow = SPECIAL_EFFECTS.filter(
    (effect) =>
      !isAbility(effect.type) ||
      build.flat().includes(effect.type) ||
      build2.flat().includes(effect.type)
  ).reverse(); // reverse to show Tacticooler first as it always shows

  return (
    <div className="analyzer__effects-selector">
      {effectsToShow.map((effect) => {
        return (
          <React.Fragment key={effect.type}>
            <div>
              {isAbility(effect.type) ? (
                <Ability ability={effect.type} size="SUB" />
              ) : (
                <Image
                  path={specialWeaponImageUrl(15)}
                  alt={t("weapons:SPECIAL_15")}
                  height={32}
                  width={32}
                />
              )}
            </div>
            <div>
              {effect.type === "LDE" ? (
                <select
                  value={ldeIntensity}
                  onChange={(e) =>
                    handleLdeIntensityChange(Number(e.target.value))
                  }
                  className="analyzer__lde-intensity-select"
                >
                  {new Array(MAX_LDE_INTENSITY + 1).fill(null).map((_, i) => {
                    const percentage = ((i / MAX_LDE_INTENSITY) * 100)
                      .toFixed(2)
                      .replace(".00", "");

                    return (
                      <option key={i} value={i}>
                        {percentage}% (+{lastDitchEffortIntensityToAp(i)}{" "}
                        {t("analyzer:abilityPoints.short")})
                      </option>
                    );
                  })}
                </select>
              ) : (
                <Toggle
                  checked={effects.includes(effect.type)}
                  setChecked={(checked) =>
                    checked
                      ? handleAddEffect(effect.type)
                      : handleRemoveEffect(effect.type)
                  }
                  tiny
                />
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function AbilityChunksRequired({
  build,
}: {
  build: BuildAbilitiesTupleWithUnknown;
}) {
  const { t } = useTranslation("analyzer");
  const abilityChunksMapAsArray = getAbilityChunksMapAsArray(build);

  return (
    <details className="w-full">
      <summary className="analyzer__ap-summary">{t("abilityChunks")}</summary>
      <div className="stack sm horizontal flex-wrap mt-4">
        {abilityChunksMapAsArray.map((a) => {
          const mainAbilityName = a[0];
          const numChunksRequired = a[1];

          return (
            <div
              key={`abilityChunksRequired_${mainAbilityName}`}
              className="stack items-center"
            >
              <Ability ability={mainAbilityName} size="TINY" />
              <div className="analyzer__ap-text">{numChunksRequired}</div>
            </div>
          );
        })}
      </div>
    </details>
  );
}

function StatCategory({
  title,
  children,
  containerClassName = "analyzer__stat-collection",
  textBelow,
  summaryRightContent,
  testId,
}: {
  title: string;
  children: React.ReactNode;
  containerClassName?: string;
  textBelow?: string;
  summaryRightContent?: React.ReactNode;
  testId?: string;
}) {
  return (
    <details className="analyzer__details">
      <summary className="analyzer__summary" data-testid={testId}>
        {title}
        {summaryRightContent}
      </summary>
      <div className={containerClassName}>{children}</div>
      {textBelow && (
        <div className="analyzer__stat-category-explanation">{textBelow}</div>
      )}
    </details>
  );
}

function StatCard({
  title,
  stat,
  suffix,
  popoverInfo,
  abilityPoints,
  isComparing,
  testId,
}: {
  title: string;
  stat: [Stat, Stat] | [Stat<string>, Stat<string>] | number | string;
  suffix?: string;
  popoverInfo?: string;
  abilityPoints: AbilityPoints;
  isComparing: boolean;
  testId?: string;
}) {
  const { t } = useTranslation("analyzer");

  const isStaticValue = typeof stat === "number" || typeof stat === "string";
  const baseValue = isStaticValue ? stat : stat[0].baseValue;

  const showBuildValue = () => {
    if (isStaticValue) return false;
    if (isComparing) return true;

    // slightly hacky but handles the edge case
    // where baseValue === value which can happen when
    // you have Ninja Squid and stack swim speed
    // -> we still want to show the build value
    return [stat[0].modifiedBy].flat().some((ability) => {
      const hasStackable = (abilityPoints.get(ability) ?? 0) > 0;
      const hasEffect = baseValue !== stat[0].value;

      return hasEffect || hasStackable;
    });
  };

  const showComparison = isComparing && !isStaticValue;

  const isHighlighted = () => {
    if (!showComparison) return showBuildValue();

    return (
      stat[0].value !== stat[0].baseValue || stat[1].value !== stat[1].baseValue
    );
  };

  return (
    <div
      className={clsx("analyzer__stat-card", {
        "analyzer__stat-card-highlighted": isHighlighted(),
      })}
      data-testid={testId}
    >
      <div className="analyzer__stat-card__title-and-value-container">
        <h3 className="analyzer__stat-card__title">
          {title}{" "}
          {popoverInfo && (
            <Popover
              containerClassName="analyzer__stat-card__popover"
              triggerClassName="analyzer__stat-card__popover-trigger"
              buttonChildren={<>?</>}
            >
              {popoverInfo}
            </Popover>
          )}
        </h3>
        <div className="analyzer__stat-card-values">
          <div className="analyzer__stat-card__value">
            <h4 className="analyzer__stat-card__value__title">
              {typeof stat === "number"
                ? t("value")
                : showComparison
                ? t("build1")
                : t("base")}
            </h4>{" "}
            <div
              className="analyzer__stat-card__value__number"
              data-testid={testId ? `${testId}-base` : undefined}
            >
              {showComparison ? (stat as [Stat, Stat])[0].value : baseValue}
              {suffix}
            </div>
          </div>
          {showBuildValue() ? (
            <div className="analyzer__stat-card__value">
              <h4
                className="analyzer__stat-card__value__title"
                data-testid={testId ? `${testId}-build-title` : undefined}
              >
                {showComparison ? t("build2") : t("build")}
              </h4>{" "}
              <div className="analyzer__stat-card__value__number">
                {(stat as [Stat, Stat])[showComparison ? 1 : 0].value}
                {suffix}
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <div className="analyzer__stat-card__ability-container">
        {!isStaticValue && (
          <ModifiedByAbilities abilities={stat[0].modifiedBy} />
        )}
      </div>
    </div>
  );
}

function ModifiedByAbilities({ abilities }: { abilities: Stat["modifiedBy"] }) {
  const abilitiesArray = Array.isArray(abilities) ? abilities : [abilities];

  return (
    <div className="stack horizontal sm items-center justify-center">
      {abilitiesArray.map((ability) => (
        <Ability key={ability} ability={ability} size="TINY" />
      ))}
    </div>
  );
}

function DamageTable({
  values,
  multiShots,
}: {
  values:
    | AnalyzedBuild["stats"]["damages"]
    | AnalyzedBuild["stats"]["subWeaponDefenseDamages"];
  multiShots: AnalyzedBuild["weapon"]["multiShots"];
}) {
  const { t } = useTranslation(["weapons", "analyzer"]);

  const showDistanceColumn = values.some((val) => val.distance);

  const firstRow = atOrError(values, 0);
  const showDamageColumn =
    !damageIsSubWeaponDamage(firstRow) ||
    // essentially checking that we are using some sub resistance up
    values.some((val) => val.value !== (val as any).baseValue);

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>{t("analyzer:damage.header.type")}</th>
            {showDistanceColumn && (
              <th>{t("analyzer:damage.header.distance")}</th>
            )}
            {damageIsSubWeaponDamage(firstRow) ? (
              <th>{t("analyzer:damage.header.baseDamage")}</th>
            ) : null}
            {showDamageColumn && <th>{t("analyzer:damage.header.damage")}</th>}
          </tr>
        </thead>
        <tbody>
          {values.map((val) => {
            const damage =
              multiShots && damageTypeToWeaponType[val.type] === "MAIN"
                ? new Array(multiShots).fill(val.value).join(" + ")
                : val.value;

            const typeRowName = damageIsSubWeaponDamage(val)
              ? (`weapons:SUB_${val.subWeaponId}` as const)
              : damageTypeTranslationString({
                  damageType: val.type,
                });

            return (
              <tr key={val.id}>
                <td className="stack horizontal xs items-center">
                  {damageIsSubWeaponDamage(val) ? (
                    <Image
                      alt=""
                      path={subWeaponImageUrl(val.subWeaponId)}
                      width={12}
                      height={12}
                    />
                  ) : null}{" "}
                  {t(typeRowName)}{" "}
                  {damageIsSubWeaponDamage(val) && val.type === "SPLASH" ? (
                    <>({t("analyzer:damage.SPLASH")})</>
                  ) : null}
                </td>
                {showDistanceColumn && (
                  <td>
                    {typeof val.distance === "number"
                      ? val.distance
                      : val.distance?.join("-")}
                  </td>
                )}
                {damageIsSubWeaponDamage(val) && <td>{val.baseValue}</td>}
                {showDamageColumn && (
                  <td>
                    {damage}{" "}
                    {val.shotsToSplat && (
                      <span className="analyzer__shots-to-splat">
                        {t("analyzer:damage.toSplat", {
                          count: val.shotsToSplat,
                        })}
                      </span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

function ConsumptionTable({
  isComparing,
  options,
  subWeaponId,
}: {
  isComparing: boolean;
  options: [
    AnalyzedBuild["stats"]["fullInkTankOptions"],
    AnalyzedBuild["stats"]["fullInkTankOptions"]
  ];
  subWeaponId: SubWeaponId;
}) {
  const [options1, options2] = options;

  const { t } = useTranslation(["analyzer", "weapons"]);
  const maxSubsToUse =
    subWeaponId === TORPEDO_ID
      ? 1
      : Math.max(...options.flat().map((opt) => opt.subsUsed));
  const types = Array.from(new Set(options1.map((opt) => opt.type)));

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>{t(`weapons:SUB_${subWeaponId}`)}</th>
            {types.map((type) => (
              <th key={type}>{t(`analyzer:stat.consumption.${type}`)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {new Array(maxSubsToUse + 1).fill(null).map((_, subsUsed) => {
            const options1ForThisSubsUsed = options1.filter(
              (opt) => opt.subsUsed === subsUsed
            );
            const options2ForThisSubsUsed = options2.filter(
              (opt) => opt.subsUsed === subsUsed
            );

            const cells: React.ReactNode[] = [];

            // weird using basic for loop in react code but here we are essentially
            // zipping these two arrays into one cell and if one of the arrays
            // doesn't have value then it shows as a dash instead
            for (
              let i = 0;
              i <
              Math.max(
                options1ForThisSubsUsed.length,
                options2ForThisSubsUsed.length
              );
              i++
            ) {
              const opt1 = options1ForThisSubsUsed[i];
              const opt2 = options2ForThisSubsUsed[i];

              const contents = !isComparing
                ? opt1.value
                : `${opt1?.value ?? "-"}/${opt2?.value ?? "-"}`;

              cells.push(<td key={opt1?.id ?? opt2.id}>{contents}</td>);
            }

            return (
              <tr key={subsUsed}>
                <td>×{subsUsed}</td>
                {cells}
              </tr>
            );
          })}
        </tbody>
      </table>
      {subWeaponId === TORPEDO_ID && (
        <div className="analyzer__consumption-table-explanation">
          <> {t("analyzer:torpedoExplanation")}</>
        </div>
      )}
    </>
  );
}
