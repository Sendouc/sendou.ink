import { WeaponCombobox } from "~/components/Combobox";
import { Image } from "~/components/Image";
import { Main } from "~/components/Main";
import {
  DAMAGE_RECEIVERS,
  useObjectDamage,
  type HitPoints,
} from "~/modules/analyzer";
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

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const handle: SendouRouteHandle = {
  i18n: ["weapons"],
};

export default function ObjectDamagePage() {
  const { mainWeaponId, handleChange, multipliers, damages, hitPoints } =
    useObjectDamage();

  if (process.env.NODE_ENV !== "development") {
    return <Main>WIP :)</Main>;
  }

  console.log(JSON.stringify(multipliers, null, 2));
  console.log(JSON.stringify(damages, null, 2));

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
      <div
        className="object-damage__grid"
        style={{ "--columns-count": "2" } as any}
      >
        <DamageReceiversHeader hitPoints={hitPoints} />
      </div>
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
function DamageReceiversHeader({ hitPoints }: { hitPoints: HitPoints }) {
  return (
    <>
      {DAMAGE_RECEIVERS.map((receiver, i) => (
        <>
          <Image
            key={i}
            alt=""
            path={damageReceiverImages[receiver]}
            width={40}
            height={40}
          />
          <div>{hitPoints[receiver]}</div>
        </>
      ))}
    </>
  );
}
