import { type LinksFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { AbilitiesSelector } from "~/components/AbilitiesSelector";
import { Ability } from "~/components/Ability";
import { WeaponCombobox } from "~/components/Combobox";
import { Main } from "~/components/Main";
import type { Stat } from "~/modules/analyzer";
import { useAnalyzeBuild } from "~/modules/analyzer";
import type { AnalyzedBuild, FullInkTankOption } from "~/modules/analyzer";
import type { MainWeaponId } from "~/modules/in-game-lists";
import styles from "~/styles/analyzer.css";
import { Image } from "~/components/Image";
import { specialWeaponImageUrl, subWeaponImageUrl } from "~/utils/urls";

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
              />
            </div>
            <KitCards analyzed={analyzed} />
          </div>
          <AbilitiesSelector selectedAbilities={build} onChange={setBuild} />
        </div>
        <div className="stack md">
          <StatCategory title="Special">
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
            title="Actions per ink tank"
            containerClassName="analyzer__consumption-table-container"
          >
            <ConsumptionTable options={analyzed.stats.fullInkTankOptions} />
          </StatCategory>
        </div>
      </div>
    </Main>
  );
}

function KitCards({ analyzed }: { analyzed: AnalyzedBuild }) {
  const { t } = useTranslation("weapons");

  return (
    <div className="analyzer__kit-cards">
      <div className="analyzer__kit-card">
        <Image
          path={subWeaponImageUrl(analyzed.weapon.subWeaponSplId)}
          width={20}
          height={20}
          alt={t(`SUB_${analyzed.weapon.subWeaponSplId}`)}
        />
        {t(`SUB_${analyzed.weapon.subWeaponSplId}`)}
      </div>
      <div className="analyzer__kit-card">
        <Image
          path={specialWeaponImageUrl(analyzed.weapon.specialWeaponSplId)}
          width={20}
          height={20}
          alt={t(`SPECIAL_${analyzed.weapon.specialWeaponSplId}`)}
        />
        {t(`SPECIAL_${analyzed.weapon.specialWeaponSplId}`)}
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

// xxx: cobra kai style
function StatCard({
  title,
  stat,
  suffix,
}: {
  title: string;
  stat: Stat;
  suffix?: string;
}) {
  return (
    <div key={title} className="analyzer__stat-card">
      <div>
        <h4 className="analyzer__stat-card__title">{title}</h4>
        {stat.value !== stat.baseValue && (
          <div className="analyzer__stat-card__value">
            Current: {stat.value}
            {suffix}
          </div>
        )}
        <div className="analyzer__stat-card__value text-lighter">
          Base: {stat.baseValue}
          {suffix}
        </div>
      </div>
      <div className="stack items-center">
        <Ability ability={stat.modifiedBy} size="TINY" />
      </div>
    </div>
  );
}

function ConsumptionTable({ options }: { options: Array<FullInkTankOption> }) {
  const { t } = useTranslation("analyzer");
  const maxSubsToUse = Math.max(...options.map((opt) => opt.subsUsed));
  const types = Array.from(new Set(options.map((opt) => opt.type)));

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>{t("stat.consumption.bomb")}</th>
            {types.map((type) => (
              <th key={type}>{t(`stat.consumption.${type}`)}</th>
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
        {t("consumptionExplanation", { maxSubsToUse })}
      </div>
    </>
  );
}
