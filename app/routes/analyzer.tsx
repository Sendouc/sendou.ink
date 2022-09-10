import { type LinksFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { AbilitiesSelector } from "~/components/AbilitiesSelector";
import { Ability } from "~/components/Ability";
import { WeaponCombobox } from "~/components/Combobox";
import { Main } from "~/components/Main";
import type { Stat } from "~/modules/analyzer";
import { useAnalyzeBuild } from "~/modules/analyzer";
import styles from "~/styles/analyzer.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const handle = {
  i18n: ["weapons", "analyzer"],
};

export default function BuildAnalyzerPage() {
  const { t } = useTranslation("analyzer");
  const { build, setBuild, weaponId, analyzed } = useAnalyzeBuild();

  if (process.env.NODE_ENV === "production") return <Main>Coming soon :)</Main>;

  return (
    <Main>
      <div className="analyzer__container">
        <div className="stack lg items-center">
          <WeaponCombobox inputName="weapon-1" initialWeaponId={weaponId} />
          <AbilitiesSelector selectedAbilities={build} onChange={setBuild} />
        </div>
        <div>
          <StatCategory title="Special">
            <StatCollection
              stats={[
                {
                  title: t("stat.specialPoints"),
                  stat: analyzed.stats.specialPoint,
                },
              ]}
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
      {children}
    </details>
  );
}

function StatCollection({
  stats,
}: {
  stats: Array<{ title: string; stat: Stat }>;
}) {
  return (
    <div className="analyzer__stat-collection">
      {stats.map(({ title, stat }) => (
        <div key={title} className="analyzer__stat-card">
          <h4 className="analyzer__stat-card__title">{title}</h4>
          {stat.value !== stat.baseValue && (
            <div className="analyzer__stat-card__value">
              Current: {stat.value}
            </div>
          )}
          <div className="analyzer__stat-card__value text-lighter">
            Base: {stat.baseValue}
          </div>
          <div className="stack items-center mt-4">
            <Ability ability={stat.modifiedBy} size="TINY" />
          </div>
        </div>
      ))}
    </div>
  );
}
