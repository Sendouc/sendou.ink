import { type MetaFunction, type LinksFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { AbilitiesSelector } from "~/components/AbilitiesSelector";
import { Ability } from "~/components/Ability";
import { WeaponCombobox } from "~/components/Combobox";
import { Image } from "~/components/Image";
import { Main } from "~/components/Main";
import { useSetTitle } from "~/hooks/useSetTitle";
import type { AnalyzedBuild, Stat } from "~/modules/analyzer";
import { useAnalyzeBuild } from "~/modules/analyzer";
import type { MainWeaponId, SubWeaponId } from "~/modules/in-game-lists";
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

export default function BuildAnalyzerPage() {
  const { t } = useTranslation(["analyzer", "common"]);
  useSetTitle(t("common:pages.buildAnalyzer"));
  const { build, setBuild, mainWeaponId, setMainWeaponId, analyzed } =
    useAnalyzeBuild();

  // xxx: remove before prod
  if (process.env.NODE_ENV === "production") return <Main>Coming soon :)</Main>;

  return (
    <Main>
      <div className="analyzer__container">
        <div className="stack lg items-center">
          <div className="stack sm items-center w-full">
            <div className="w-full">
              <WeaponCombobox
                inputName="weapon"
                initialWeaponId={mainWeaponId}
                onChange={(opt) =>
                  opt && setMainWeaponId(Number(opt.value) as MainWeaponId)
                }
                className="w-full-important"
                clearsInputOnFocus
              />
            </div>
            <WeaponInfoBadges analyzed={analyzed} />
          </div>
          <AbilitiesSelector selectedAbilities={build} onChange={setBuild} />
          <div className="analyzer__patch">
            {t("analyzer:patch")} {CURRENT_PATCH}
          </div>
        </div>
        <div className="stack md">
          {/* xxx: make sure can't be empty */}
          <StatCategory title={t("analyzer:stat.category.main")}>
            {typeof analyzed.stats.mainWeaponWhiteInkSeconds === "number" && (
              <StatCard
                stat={analyzed.stats.mainWeaponWhiteInkSeconds}
                title={t("analyzer:stat.whiteInk")}
                suffix={t("analyzer:suffix.seconds")}
              />
            )}
            {typeof analyzed.weapon.brellaCanopyHp === "number" && (
              <StatCard
                stat={analyzed.weapon.brellaCanopyHp}
                title={t("analyzer:stat.canopyHp")}
                suffix={t("analyzer:suffix.hp")}
              />
            )}
            {typeof analyzed.weapon.fullChargeSeconds === "number" && (
              <StatCard
                stat={analyzed.weapon.fullChargeSeconds}
                title={t("analyzer:stat.fullChargeSeconds")}
                suffix={t("analyzer:suffix.seconds")}
              />
            )}
            {typeof analyzed.weapon.maxChargeHoldSeconds === "number" && (
              <StatCard
                stat={analyzed.weapon.maxChargeHoldSeconds}
                title={t("analyzer:stat.maxChargeHoldSeconds")}
                suffix={t("analyzer:suffix.seconds")}
              />
            )}
          </StatCategory>
          <StatCategory title={t("analyzer:stat.category.sub")}>
            <StatCard
              stat={analyzed.stats.subWeaponWhiteInkSeconds}
              title={t("analyzer:stat.whiteInk")}
              suffix={t("analyzer:suffix.seconds")}
            />
          </StatCategory>
          <StatCategory title={t("analyzer:stat.category.special")}>
            <StatCard
              stat={analyzed.stats.specialPoint}
              title={t("analyzer:stat.specialPoints")}
              suffix="p"
            />
            <StatCard
              stat={analyzed.stats.specialSavedAfterDeath}
              title={t("analyzer:stat.specialLost")}
              suffix="%"
            />
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
}: {
  title: string;
  stat: Stat | number;
  suffix?: string;
}) {
  const { t } = useTranslation("analyzer");
  const baseValue = typeof stat === "number" ? stat : stat.baseValue;

  return (
    <div key={title} className="analyzer__stat-card">
      <div>
        <h3 className="analyzer__stat-card__title">{title}</h3>
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
        <div className="stack items-center">
          <Ability ability={stat.modifiedBy} size="TINY" />
        </div>
      )}
    </div>
  );
}

// xxx: fizzy sloshing machine
// xxx: curling roller
// xxx: splatana torpedo
// xxx: angle shooter
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
              : // xxx: maybe this could use a sub type where "BOMB_" starting are filtered out
                t(`analyzer:damage.${val.type as "NORMAL_MIN"}`);

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
