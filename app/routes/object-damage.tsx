import { WeaponCombobox } from "~/components/Combobox";
import { Image } from "~/components/Image";
import { Main } from "~/components/Main";
import { DAMAGE_RECEIVERS, useObjectDamage } from "~/modules/analyzer";
import {
  type MainWeaponId,
  BIG_BUBBLER_ID,
  BOOYAH_BOMB_ID,
  CRAB_TANK_ID,
  SPLASH_WALL_ID,
  SQUID_BEAKON_ID,
  TORPEDO_ID,
  WAVE_BREAKER_ID,
  SPRINKLER_ID,
} from "~/modules/in-game-lists";
import {
  mainWeaponImageUrl,
  modeImageUrl,
  specialWeaponImageUrl,
  subWeaponImageUrl,
} from "~/utils/urls";
import styles from "~/styles/object-damage.css";
import type { LinksFunction } from "@remix-run/node";
import type { SendouRouteHandle } from "~/utils/remix";
import type { DamageReceiver } from "~/modules/analyzer/types";
import React from "react";
import { roundToTwoDecimalPlaces } from "~/utils/number";
import { useTranslation } from "react-i18next";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const handle: SendouRouteHandle = {
  i18n: ["weapons", "analyzer"],
};

export default function ObjectDamagePage() {
  const {
    mainWeaponId,
    subWeaponId,
    handleChange,
    multipliers,
    damages,
    hitPoints,
  } = useObjectDamage();

  if (process.env.NODE_ENV !== "development") {
    return <Main>WIP :)</Main>;
  }

  return (
    <Main className="stack lg">
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
      <DamageReceiversGrid
        subWeaponId={subWeaponId}
        hitPoints={hitPoints}
        damages={damages}
        multipliers={multipliers}
      />
    </Main>
  );
}

const damageReceiverImages: Record<DamageReceiver, string> = {
  Bomb_TorpedoBullet: subWeaponImageUrl(TORPEDO_ID),
  Chariot: specialWeaponImageUrl(CRAB_TANK_ID),
  Gachihoko_Barrier: modeImageUrl("RM"),
  GreatBarrier_Barrier: specialWeaponImageUrl(BIG_BUBBLER_ID),
  GreatBarrier_WeakPoint: specialWeaponImageUrl(BIG_BUBBLER_ID),
  InkRail: modeImageUrl("CB"),
  NiceBall_Armor: specialWeaponImageUrl(BOOYAH_BOMB_ID),
  ShockSonar: specialWeaponImageUrl(WAVE_BREAKER_ID),
  Sponge_Versus: modeImageUrl("CB"),
  Wsb_Flag: subWeaponImageUrl(SQUID_BEAKON_ID),
  Wsb_Shield: subWeaponImageUrl(SPLASH_WALL_ID),
  Wsb_Sprinkler: subWeaponImageUrl(SPRINKLER_ID),
  BulletUmbrellaCanopyNormal: mainWeaponImageUrl(6000),
  BulletUmbrellaCanopyWide: mainWeaponImageUrl(6010),
  BulletUmbrellaCanopyCompact: mainWeaponImageUrl(6020),
};

function DamageReceiversGrid({
  subWeaponId,
  hitPoints,
  damages,
  multipliers,
}: Pick<
  ReturnType<typeof useObjectDamage>,
  "hitPoints" | "damages" | "multipliers" | "subWeaponId"
>) {
  const { t } = useTranslation(["weapons", "analyzer"]);

  return (
    <div
      className="object-damage__grid"
      style={{ "--columns-count": String(2 + damages.length) } as any}
    >
      <div />
      <div />
      {damages.map((damage) => (
        <div key={damage.id} className="object-damage__table-header">
          {damage.type.startsWith("BOMB_")
            ? t(`weapons:SUB_${subWeaponId}`)
            : t(`analyzer:damage.${damage.type as "NORMAL_MIN"}`)}
        </div>
      ))}
      {DAMAGE_RECEIVERS.map((receiver, i) => {
        const damageReceiverHp = hitPoints[receiver];

        return (
          <React.Fragment key={receiver}>
            <Image
              key={i}
              alt=""
              path={damageReceiverImages[receiver]}
              width={40}
              height={40}
            />
            <div className="object-damage__hp">{damageReceiverHp}hp</div>
            {damages.map((damage) => {
              const multiplier = multipliers[damage.type]![receiver];
              const damagePerHit = roundToTwoDecimalPlaces(
                damage.value * multiplier
              );

              const hitsToDestroy = Math.ceil(damageReceiverHp / damagePerHit);

              return (
                <div key={damage.id} className="object-damage__table-card">
                  <div className="object-damage__table-card__results">
                    <abbr className="object-damage__abbr" title="Damage">
                      DMG
                    </abbr>
                    <div>{damagePerHit}</div>
                    <abbr
                      className="object-damage__abbr"
                      title="Hits to destroy"
                    >
                      HTD
                    </abbr>
                    <div>{hitsToDestroy}</div>
                  </div>
                  <div className="object-damage__multiplier">×{multiplier}</div>
                </div>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}
