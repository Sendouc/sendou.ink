import type { LinksFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { Image } from "~/components/Image";
import { Main } from "~/components/Main";
import { modes, stageIds } from "~/modules/in-game-lists";
import styles from "~/styles/maps.css";
import { modeImageUrl } from "~/utils/urls";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const handle = {
  i18n: "game-misc",
};

export default function MapListPage() {
  return (
    <Main halfWidth>
      <MapPoolSelector />
    </Main>
  );
}

function MapPoolSelector() {
  const { t } = useTranslation(["game-misc"]);

  return (
    <div className="stack md">
      {stageIds.map((stageId) => (
        <div key={stageId} className="maps__stage-row">
          <div>{t(`game-misc:STAGE_${stageId}`)}</div>
          <div className="stack horizontal sm">
            {modes
              .filter((mode) => mode.short !== "TW")
              .map((mode) => (
                <button
                  key={mode.short}
                  className="maps__mode-button outline-theme"
                  type="button"
                >
                  <Image
                    alt={mode.long}
                    path={modeImageUrl(mode.short)}
                    width={20}
                    height={20}
                  />
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
