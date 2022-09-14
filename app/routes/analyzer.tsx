import { type LinksFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { AbilitiesSelector } from "~/components/AbilitiesSelector";
import { Ability } from "~/components/Ability";
import { WeaponCombobox } from "~/components/Combobox";
import { Main } from "~/components/Main";
import type { Stat } from "~/modules/analyzer";
import { useAnalyzeBuild } from "~/modules/analyzer";
import type { AnalyzedBuild, FullInkTankOption } from "~/modules/analyzer";
import type { MainWeaponId, SubWeaponId } from "~/modules/in-game-lists";
import styles from "~/styles/analyzer.css";
import { Image } from "~/components/Image";
import { specialWeaponImageUrl, subWeaponImageUrl } from "~/utils/urls";

export const CURRENT_PATCH = "1.1";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const handle = {
  i18n: ["weapons", "analyzer"],
};

export default function BuildAnalyzerPage() {
  const { t } = useTranslation("analyzer");
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
            {t("patch")} {CURRENT_PATCH}
          </div>
        </div>
        <div className="stack md">
          <StatCategory title={t("stat.category.sub")}>
            <StatCard
              stat={analyzed.stats.subWeaponWhiteInkFrames}
              title={t("stat.whiteInkFrames")}
            />
          </StatCategory>
          <StatCategory title={t("stat.category.special")}>
            <StatCard
              stat={analyzed.stats.specialPoint}
              title={t("stat.specialPoints")}
              suffix="p"
            />
            <StatCard
              stat={analyzed.stats.specialSavedAfterDeath}
              title={t("stat.specialLost")}
              suffix="%"
            />
          </StatCategory>
          <StatCategory
            title={t("stat.category.actionsPerInkTank")}
            containerClassName="analyzer__consumption-table-container"
          >
            <ConsumptionTable
              options={analyzed.stats.fullInkTankOptions}
              subWeaponId={analyzed.weapon.subWeaponSplId}
            />
          </StatCategory>
          <StatCategory title={t("stat.category.movement")}>
            <StatCard
              stat={analyzed.stats.swimSpeed}
              title={t("stat.swimSpeed")}
            />
            <StatCard
              stat={analyzed.stats.runSpeed}
              title={t("stat.runSpeed")}
            />
          </StatCategory>
          <StatCategory title={t("stat.category.misc")}>
            <StatCard
              stat={analyzed.stats.squidFormInkRecoverySeconds}
              title={t("stat.squidFormInkRecoverySeconds")}
              suffix={t("suffix.seconds")}
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

function ConsumptionTable({
  options,
  subWeaponId,
}: {
  options: Array<FullInkTankOption>;
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
                    return <td key={opt.type}>{opt.value}</td>;
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
