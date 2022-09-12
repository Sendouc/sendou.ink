import { type LinksFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { AbilitiesSelector } from "~/components/AbilitiesSelector";
import { Ability } from "~/components/Ability";
import { WeaponCombobox } from "~/components/Combobox";
import { Main } from "~/components/Main";
import type { Stat } from "~/modules/analyzer";
import { useAnalyzeBuild } from "~/modules/analyzer";
import type { MainWeaponId } from "~/modules/in-game-lists";
import styles from "~/styles/analyzer.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const handle = {
  i18n: ["weapons", "analyzer"],
};

export default function BuildAnalyzerPage() {
  const { t } = useTranslation("analyzer");
  const { build, setBuild, weaponId, setWeaponId, analyzed } =
    useAnalyzeBuild();

  if (process.env.NODE_ENV === "production") return <Main>Coming soon :)</Main>;

  return (
    <Main>
      <div className="analyzer__container">
        <div className="stack lg items-center">
          <div>
            <WeaponCombobox
              inputName="weapon"
              initialWeaponId={weaponId}
              onChange={(opt) =>
                opt && setWeaponId(Number(opt.value) as MainWeaponId)
              }
            />
          </div>
          <AbilitiesSelector selectedAbilities={build} onChange={setBuild} />
        </div>
        <div>
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
        </div>
      </div>
    </Main>
  );
}

function StatCategory({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details>
      <summary className="analyzer__summary">{title}</summary>
      <div className="analyzer__stat-collection">{children}</div>
    </details>
  );
}

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
