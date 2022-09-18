import { type MetaFunction, type LinksFunction } from "@remix-run/node";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { AbilitiesSelector } from "~/components/AbilitiesSelector";
import { Ability } from "~/components/Ability";
import { WeaponCombobox } from "~/components/Combobox";
import { Image } from "~/components/Image";
import { Main } from "~/components/Main";
import { Popover } from "~/components/Popover";
import { Toggle } from "~/components/Toggle";
import { ADMIN_DISCORD_ID } from "~/constants";
import { useSetTitle } from "~/hooks/useSetTitle";
import type { AnalyzedBuild, Stat } from "~/modules/analyzer";
import { MAX_LDE_INTENSITY } from "~/modules/analyzer";
import { useAnalyzeBuild } from "~/modules/analyzer";
import {
  lastDitchEffortIntensityToAp,
  SPECIAL_EFFECTS,
} from "~/modules/analyzer/specialEffects";
import type {
  AbilityPoints,
  SpecialEffectType,
} from "~/modules/analyzer/types";
import { useUser } from "~/modules/auth";
import {
  type BuildAbilitiesTupleWithUnknown,
  INK_STORM_ID,
} from "~/modules/in-game-lists";
import {
  SPLASH_WALL_ID,
  SPRINKLER_ID,
  TOXIC_MIST_ID,
} from "~/modules/in-game-lists";
import { ANGLE_SHOOTER_ID } from "~/modules/in-game-lists";
import { INK_MINE_ID, POINT_SENSOR_ID } from "~/modules/in-game-lists";
import {
  abilities,
  isAbility,
  type MainWeaponId,
  type SubWeaponId,
} from "~/modules/in-game-lists";
import styles from "~/styles/analyzer.css";
import { makeTitle } from "~/utils/strings";
import { specialWeaponImageUrl, subWeaponImageUrl } from "~/utils/urls";

export const CURRENT_PATCH = "1.1";

export const meta: MetaFunction = () => {
  return {
    title: makeTitle("Build Analyzer"),
  };
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const handle = {
  i18n: ["weapons", "analyzer"],
};

const canViewInProduction = (discordId?: string) => {
  const LEAN_ID = "86905636402495488";
  const SENDOU_ID = ADMIN_DISCORD_ID;

  return discordId === LEAN_ID || discordId === SENDOU_ID;
};

export default function BuildAnalyzerPage() {
  const user = useUser();
  const { t } = useTranslation(["analyzer", "common", "weapons"]);
  useSetTitle(t("common:pages.buildAnalyzer"));
  const {
    build,
    mainWeaponId,
    handleChange,
    analyzed,
    abilityPoints,
    ldeIntensity,
    effects,
  } = useAnalyzeBuild();

  if (
    process.env.NODE_ENV === "production" &&
    !canViewInProduction(user?.discordId)
  ) {
    return <Main>Coming soon :)</Main>;
  }

  const mainWeaponCategoryItems = [
    analyzed.stats.shotSpreadAir && (
      <StatCard
        key="jumpShotSpread"
        stat={analyzed.stats.shotSpreadAir}
        title={t("analyzer:stat.jumpShotSpread")}
        suffix="°"
      />
    ),
    typeof analyzed.stats.shotSpreadGround === "number" && (
      <StatCard
        key="groundShotSpread"
        stat={analyzed.stats.shotSpreadGround}
        title={t("analyzer:stat.groundShotSpread")}
        suffix="°"
      />
    ),
    typeof analyzed.stats.mainWeaponWhiteInkSeconds === "number" && (
      <StatCard
        key="whiteInkSeconds"
        stat={analyzed.stats.mainWeaponWhiteInkSeconds}
        title={t("analyzer:stat.whiteInk")}
        suffix={t("analyzer:suffix.seconds")}
      />
    ),
    typeof analyzed.weapon.brellaCanopyHp === "number" && (
      <StatCard
        key="brellaCanopyHp"
        stat={analyzed.weapon.brellaCanopyHp}
        title={t("analyzer:stat.canopyHp")}
        suffix={t("analyzer:suffix.hp")}
      />
    ),
    typeof analyzed.weapon.fullChargeSeconds === "number" && (
      <StatCard
        key="fullChargeSeconds"
        stat={analyzed.weapon.fullChargeSeconds}
        title={t("analyzer:stat.fullChargeSeconds")}
        suffix={t("analyzer:suffix.seconds")}
      />
    ),
    typeof analyzed.weapon.maxChargeHoldSeconds === "number" && (
      <StatCard
        key="maxChargeHoldSeconds"
        stat={analyzed.weapon.maxChargeHoldSeconds}
        title={t("analyzer:stat.maxChargeHoldSeconds")}
        suffix={t("analyzer:suffix.seconds")}
      />
    ),
  ].filter(Boolean);

  return (
    <Main>
      <div className="analyzer__container">
        <div className="analyzer__left-column">
          <div className="stack sm items-center w-full">
            <div className="w-full">
              <WeaponCombobox
                inputName="weapon"
                initialWeaponId={mainWeaponId}
                onChange={(opt) =>
                  opt &&
                  handleChange({
                    newMainWeaponId: Number(opt.value) as MainWeaponId,
                  })
                }
                className="w-full-important"
                clearsInputOnFocus
              />
            </div>
            <WeaponInfoBadges analyzed={analyzed} />
          </div>
          <div className="stack md items-center">
            <AbilitiesSelector
              selectedAbilities={build}
              onChange={(newBuild) => handleChange({ newBuild })}
            />
            <EffectsSelector
              build={build}
              ldeIntensity={ldeIntensity}
              handleLdeIntensityChange={(newLdeIntensity) =>
                handleChange({ newLdeIntensity })
              }
              handleAddEffect={(newEffect) =>
                handleChange({ newEffects: [...effects, newEffect] })
              }
              handleRemoveEffect={(effectToRemove) =>
                handleChange({
                  newEffects: effects.filter((e) => e !== effectToRemove),
                })
              }
              effects={effects}
            />
            <AbilityPointsDetails abilityPoints={abilityPoints} />
          </div>
          <div className="analyzer__patch">
            {t("analyzer:patch")} {CURRENT_PATCH}
          </div>
        </div>
        <div className="stack md">
          {mainWeaponCategoryItems.length > 0 && (
            <StatCategory title={t("analyzer:stat.category.main")}>
              {mainWeaponCategoryItems}
            </StatCategory>
          )}

          <StatCategory title={t("analyzer:stat.category.sub")}>
            <StatCard
              stat={analyzed.stats.subWeaponWhiteInkSeconds}
              title={t("analyzer:stat.whiteInk")}
              suffix={t("analyzer:suffix.seconds")}
            />
            {analyzed.stats.subVelocity && (
              <StatCard
                stat={analyzed.stats.subVelocity}
                title={t("analyzer:stat.sub.velocity")}
              />
            )}
            {analyzed.stats.subFirstPhaseDuration && (
              <StatCard
                stat={analyzed.stats.subFirstPhaseDuration}
                title={t("analyzer:stat.sub.firstPhaseDuration")}
                suffix={t("analyzer:suffix.seconds")}
              />
            )}
            {analyzed.stats.subSecondPhaseDuration && (
              <StatCard
                stat={analyzed.stats.subSecondPhaseDuration}
                title={t("analyzer:stat.sub.secondPhaseDuration")}
                suffix={t("analyzer:suffix.seconds")}
              />
            )}
            {analyzed.stats.subMarkingTimeInSeconds && (
              <StatCard
                stat={analyzed.stats.subMarkingTimeInSeconds}
                title={t("analyzer:stat.sub.markingTimeInSeconds")}
                suffix={t("analyzer:suffix.seconds")}
              />
            )}
            {analyzed.stats.subMarkingRadius && (
              <StatCard
                stat={analyzed.stats.subMarkingRadius}
                title={t("analyzer:stat.sub.markingRadius")}
              />
            )}
            {analyzed.stats.subExplosionRadius && (
              <StatCard
                stat={analyzed.stats.subExplosionRadius}
                title={t("analyzer:stat.sub.explosionRadius")}
              />
            )}
            {analyzed.stats.subHp && (
              <StatCard
                stat={analyzed.stats.subHp}
                title={t("analyzer:stat.sub.hp")}
                suffix={t("analyzer:suffix.hp")}
              />
            )}
          </StatCategory>

          <StatCategory title={t("analyzer:stat.category.special")}>
            <StatCard
              stat={analyzed.stats.specialPoint}
              title={t("analyzer:stat.specialPoints")}
              suffix={t("analyzer:suffix.specialPointsShort")}
            />
            <StatCard
              stat={analyzed.stats.specialSavedAfterDeath}
              title={t("analyzer:stat.specialLost")}
              suffix="%"
            />
            {analyzed.stats.specialDurationInSeconds && (
              <StatCard
                stat={analyzed.stats.specialDurationInSeconds}
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
                stat={analyzed.stats.specialDamageDistance}
                title={t("analyzer:stat.special.damageDistance", {
                  weapon: t(
                    `weapons:SPECIAL_${analyzed.weapon.specialWeaponSplId}`
                  ),
                })}
              />
            )}
            {analyzed.stats.specialPaintRadius && (
              <StatCard
                stat={analyzed.stats.specialPaintRadius}
                title={t("analyzer:stat.special.paintRadius", {
                  weapon: t(
                    `weapons:SPECIAL_${analyzed.weapon.specialWeaponSplId}`
                  ),
                })}
              />
            )}
            {analyzed.stats.specialFieldHp && (
              <StatCard
                stat={analyzed.stats.specialFieldHp}
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
                stat={analyzed.stats.specialDeviceHp}
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
                stat={analyzed.stats.specialHookInkConsumptionPercentage}
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
                stat={analyzed.stats.specialInkConsumptionPerSecondPercentage}
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
                stat={analyzed.stats.specialReticleRadius}
                title={t("analyzer:stat.special.reticleRadius", {
                  weapon: t(
                    `weapons:SPECIAL_${analyzed.weapon.specialWeaponSplId}`
                  ),
                })}
              />
            )}
            {analyzed.stats.specialThrowDistance && (
              <StatCard
                stat={analyzed.stats.specialThrowDistance}
                title={t("analyzer:stat.special.throwDistance", {
                  weapon: t(
                    `weapons:SPECIAL_${analyzed.weapon.specialWeaponSplId}`
                  ),
                })}
              />
            )}
          </StatCategory>
          <StatCategory title={t("analyzer:stat.category.subDef")}>
            <StatCard
              stat={analyzed.stats.subDefBombDamageLightPercentage}
              title={t("analyzer:stat.bombLdamage")}
              suffix="%"
            />
            <StatCard
              stat={analyzed.stats.subDefBombDamageHeavyPercentage}
              title={t("analyzer:stat.bombHdamage")}
              suffix="%"
            />
            <StatCard
              stat={analyzed.stats.subDefAngleShooterDamage}
              title={t("analyzer:stat.damage", {
                weapon: t(`weapons:SUB_${ANGLE_SHOOTER_ID}`),
              })}
              suffix={t("analyzer:suffix.hp")}
            />
            <StatCard
              stat={analyzed.stats.subDefSplashWallDamagePercentage}
              title={t("analyzer:stat.damage", {
                weapon: t(`weapons:SUB_${SPLASH_WALL_ID}`),
              })}
              suffix="%"
            />
            <StatCard
              stat={analyzed.stats.subDefSprinklerDamagePercentage}
              title={t("analyzer:stat.damage", {
                weapon: t(`weapons:SUB_${SPRINKLER_ID}`),
              })}
              suffix="%"
            />
            <StatCard
              stat={analyzed.stats.subDefToxicMistMovementReduction}
              title={t("analyzer:stat.movementReduction", {
                weapon: t(`weapons:SUB_${TOXIC_MIST_ID}`),
              })}
              suffix="%"
            />
            <StatCard
              stat={analyzed.stats.subDefPointSensorMarkedTimeInSeconds}
              title={t("analyzer:stat.markedTime", {
                weapon: t(`weapons:SUB_${POINT_SENSOR_ID}`),
              })}
              suffix={t("analyzer:suffix.seconds")}
            />
            <StatCard
              stat={analyzed.stats.subDefInkMineMarkedTimeInSeconds}
              title={t("analyzer:stat.markedTime", {
                weapon: t(`weapons:SUB_${INK_MINE_ID}`),
              })}
              suffix={t("analyzer:suffix.seconds")}
            />
            <StatCard
              stat={analyzed.stats.subDefAngleShooterMarkedTimeInSeconds}
              title={t("analyzer:stat.markedTime", {
                weapon: t(`weapons:SUB_${ANGLE_SHOOTER_ID}`),
              })}
              suffix={t("analyzer:suffix.seconds")}
            />
            <div className="analyzer__stat-category-explanation">
              {t("analyzer:trackingSubDefExplanation")}
            </div>
          </StatCategory>

          {analyzed.stats.damages.length > 0 && (
            <StatCategory
              title={t("analyzer:stat.category.damage")}
              containerClassName="analyzer__table-container"
            >
              <DamageTable
                values={analyzed.stats.damages}
                isTripleShooter={analyzed.weapon.isTripleShooter}
                subWeaponId={analyzed.weapon.subWeaponSplId}
              />
            </StatCategory>
          )}

          {analyzed.stats.fullInkTankOptions.length > 0 && (
            <StatCategory
              title={t("analyzer:stat.category.actionsPerInkTank")}
              containerClassName="analyzer__table-container"
            >
              <ConsumptionTable
                options={analyzed.stats.fullInkTankOptions}
                subWeaponId={analyzed.weapon.subWeaponSplId}
              />
            </StatCategory>
          )}

          <StatCategory title={t("analyzer:stat.category.movement")}>
            <StatCard
              stat={analyzed.stats.swimSpeed}
              title={t("analyzer:stat.swimSpeed")}
            />
            <StatCard
              stat={analyzed.stats.runSpeed}
              title={t("analyzer:stat.runSpeed")}
            />
            <StatCard
              stat={analyzed.stats.runSpeedInEnemyInk}
              title={t("analyzer:stat.runSpeedInEnemyInk")}
            />
            <StatCard
              stat={analyzed.stats.framesBeforeTakingDamageInEnemyInk}
              title={t("analyzer:stat.framesBeforeTakingDamageInEnemyInk")}
            />
            <StatCard
              stat={analyzed.stats.damageTakenInEnemyInkPerSecond}
              title={t("analyzer:stat.damageTakenInEnemyInkPerSecond")}
              suffix={t("analyzer:suffix.hp")}
            />
            <StatCard
              stat={analyzed.stats.enemyInkDamageLimit}
              title={t("analyzer:stat.enemyInkDamageLimit")}
              suffix={t("analyzer:suffix.hp")}
            />
          </StatCategory>

          <StatCategory title={t("analyzer:stat.category.misc")}>
            <StatCard
              stat={analyzed.stats.squidFormInkRecoverySeconds}
              title={t("analyzer:stat.squidFormInkRecoverySeconds")}
              suffix={t("analyzer:suffix.seconds")}
            />
            <StatCard
              stat={analyzed.stats.quickRespawnTime}
              title={t("analyzer:stat.quickRespawnTime")}
              suffix={t("analyzer:suffix.seconds")}
            />
            <StatCard
              stat={analyzed.stats.superJumpTimeGroundFrames}
              title={t("analyzer:stat.superJumpTimeGround")}
            />
            <StatCard
              stat={analyzed.stats.superJumpTimeTotal}
              title={t("analyzer:stat.superJumpTimeTotal")}
              suffix={t("analyzer:suffix.seconds")}
            />
          </StatCategory>
        </div>
      </div>
    </Main>
  );
}

function WeaponInfoBadges({ analyzed }: { analyzed: AnalyzedBuild }) {
  const { t } = useTranslation(["weapons", "analyzer"]);

  return (
    <div className="analyzer__weapon-info-badges">
      <div className="analyzer__weapon-info-badge">
        <Image
          path={subWeaponImageUrl(analyzed.weapon.subWeaponSplId)}
          width={20}
          height={20}
          alt={t(`weapons:SUB_${analyzed.weapon.subWeaponSplId}`)}
        />
        {t(`weapons:SUB_${analyzed.weapon.subWeaponSplId}`)}
      </div>
      <div className="analyzer__weapon-info-badge">
        <Image
          path={specialWeaponImageUrl(analyzed.weapon.specialWeaponSplId)}
          width={20}
          height={20}
          alt={t(`weapons:SPECIAL_${analyzed.weapon.specialWeaponSplId}`)}
        />
        {t(`weapons:SPECIAL_${analyzed.weapon.specialWeaponSplId}`)}
      </div>
      <div className="analyzer__weapon-info-badge">
        {t("analyzer:attribute.weight")}{" "}
        {t(`analyzer:attribute.weight.${analyzed.weapon.speedType}`)}
      </div>
    </div>
  );
}

function EffectsSelector({
  build,
  effects,
  ldeIntensity,
  handleLdeIntensityChange,
  handleAddEffect,
  handleRemoveEffect,
}: {
  build: BuildAbilitiesTupleWithUnknown;
  effects: Array<SpecialEffectType>;
  ldeIntensity: number;
  handleLdeIntensityChange: (newLdeIntensity: number) => void;
  handleAddEffect: (effect: SpecialEffectType) => void;
  handleRemoveEffect: (effect: SpecialEffectType) => void;
}) {
  const { t } = useTranslation(["weapons", "analyzer"]);

  const effectsToShow = SPECIAL_EFFECTS.filter(
    (effect) => !isAbility(effect.type) || build.flat().includes(effect.type)
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

function AbilityPointsDetails({
  abilityPoints,
}: {
  abilityPoints: AbilityPoints;
}) {
  const { t } = useTranslation("analyzer");

  return (
    <details className="w-full">
      <summary className="analyzer__ap-summary">{t("abilityPoints")}</summary>
      <div className="stack sm horizontal flex-wrap mt-4">
        {abilities
          .filter((a) => (abilityPoints.get(a.name)?.ap ?? 0) > 0)
          .sort((a, b) => {
            return (
              abilityPoints.get(b.name)!.ap - abilityPoints.get(a.name)!.ap
            );
          })
          .map((a) => (
            <div key={a.name} className="stack items-center">
              <Ability ability={a.name} size="TINY" />
              <div className="analyzer__ap-text">
                {abilityPoints.get(a.name)?.ap}
              </div>
            </div>
          ))}
      </div>
    </details>
  );
}

function StatCategory({
  title,
  children,
  containerClassName = "analyzer__stat-collection",
}: {
  title: string;
  children: React.ReactNode;
  containerClassName?: string;
}) {
  return (
    <details>
      <summary className="analyzer__summary">{title}</summary>
      <div className={containerClassName}>{children}</div>
    </details>
  );
}

function StatCard({
  title,
  stat,
  suffix,
  popoverInfo,
}: {
  title: string;
  stat: Stat | number;
  suffix?: string;
  popoverInfo?: string;
}) {
  const { t } = useTranslation("analyzer");
  const baseValue = typeof stat === "number" ? stat : stat.baseValue;

  return (
    <div className="analyzer__stat-card">
      <div>
        <h3 className="analyzer__stat-card__title">
          {title}{" "}
          {popoverInfo && (
            <Popover
              containerClassName="analyzer__stat-card__popover"
              triggerClassName="analyzer__stat-card__popover-trigger"
              trigger={<>?</>}
            >
              {popoverInfo}
            </Popover>
          )}
        </h3>
        <div className="analyzer__stat-card-values">
          <div className="analyzer__stat-card__value">
            <h4 className="analyzer__stat-card__value__title">
              {typeof stat === "number" ? t("value") : t("base")}
            </h4>{" "}
            <div className="analyzer__stat-card__value__number">
              {baseValue}
              {suffix}
            </div>
          </div>
          {typeof stat !== "number" && stat.value !== stat.baseValue && (
            <div className="analyzer__stat-card__value">
              <h4 className="analyzer__stat-card__value__title">
                {t("build")}
              </h4>{" "}
              <div className="analyzer__stat-card__value__number">
                {stat.value}
                {suffix}
              </div>
            </div>
          )}
        </div>
      </div>
      {typeof stat !== "number" && (
        <ModifiedByAbilities abilities={stat.modifiedBy} />
      )}
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
  isTripleShooter,
  subWeaponId,
}: {
  values: AnalyzedBuild["stats"]["damages"];
  isTripleShooter: AnalyzedBuild["weapon"]["isTripleShooter"];
  subWeaponId: SubWeaponId;
}) {
  const { t } = useTranslation(["weapons", "analyzer"]);

  const showDistanceColumn = values.some((val) => val.distance);

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>{t("analyzer:damage.header.type")}</th>
            <th>{t("analyzer:damage.header.damage")}</th>
            {showDistanceColumn && (
              <th>{t("analyzer:damage.header.distance")}</th>
            )}
          </tr>
        </thead>
        <tbody>
          {values.map((val) => {
            const damage = isTripleShooter
              ? `${val.value}+${val.value}+${val.value}`
              : val.value;

            const typeRowName = val.type.startsWith("BOMB_")
              ? t(`weapons:SUB_${subWeaponId}`)
              : t(`analyzer:damage.${val.type as "NORMAL_MIN"}`);

            return (
              <tr key={val.id}>
                <td>{typeRowName}</td>
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
                {showDistanceColumn && <td>{val.distance}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

function ConsumptionTable({
  options,
  subWeaponId,
}: {
  options: AnalyzedBuild["stats"]["fullInkTankOptions"];
  subWeaponId: SubWeaponId;
}) {
  const { t } = useTranslation(["analyzer", "weapons"]);
  const maxSubsToUse = Math.max(...options.map((opt) => opt.subsUsed));
  const types = Array.from(new Set(options.map((opt) => opt.type)));

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
            return (
              <tr key={subsUsed} className="bg-darker-important">
                <td>×{subsUsed}</td>
                {options
                  .filter((opt) => opt.subsUsed === subsUsed)
                  .map((opt) => {
                    return <td key={opt.id}>{opt.value}</td>;
                  })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="analyzer__consumption-table-explanation">
        {t("analyzer:consumptionExplanation", { maxSubsToUse })}
      </div>
    </>
  );
}
