import { WeaponCombobox } from "~/components/Combobox";
import { Image } from "~/components/Image";
import { Main } from "~/components/Main";
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
  navIconUrl,
  OBJECT_DAMAGE_CALCULATOR_URL,
  specialWeaponImageUrl,
  subWeaponImageUrl,
} from "~/utils/urls";
import styles from "~/styles/object-damage.css";
import type { LinksFunction } from "@remix-run/node";
import type { SendouRouteHandle } from "~/utils/remix";
import React from "react";
import { useTranslation } from "~/hooks/useTranslation";
import clsx from "clsx";
import { Label } from "~/components/Label";
import { Ability } from "~/components/Ability";
import { damageTypeTranslationString } from "~/utils/i18next";
import { useSetTitle } from "~/hooks/useSetTitle";
import type { ShouldReloadFunction } from "@remix-run/react";
import { Toggle } from "~/components/Toggle";
import { useObjectDamage } from "~/features/build-analyzer/core/useObjectDamage";
import type { DamageReceiver } from "~/features/build-analyzer";
import { type DamageType, possibleApValues } from "~/features/build-analyzer";

export const CURRENT_PATCH = "2.0";

export const unstable_shouldReload: ShouldReloadFunction = () => false;

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const handle: SendouRouteHandle = {
  i18n: ["weapons", "analyzer"],
  breadcrumb: () => ({
    imgPath: navIconUrl("object-damage-calculator"),
    href: OBJECT_DAMAGE_CALCULATOR_URL,
    type: "IMAGE",
  }),
};

export default function ObjectDamagePage() {
  const { t } = useTranslation(["analyzer"]);
  const {
    mainWeaponId,
    subWeaponId,
    handleChange,
    damagesToReceivers,
    abilityPoints,
    damageType,
    allDamageTypes,
    multiShotCount,
    isMultiShot,
  } = useObjectDamage();

  return (
    <Main className="stack lg">
      <div className="object-damage__controls">
        <div className="object-damage__selects">
          <div>
            <Label htmlFor="weapon">{t("analyzer:labels.weapon")}</Label>
            <WeaponCombobox
              id="weapon"
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
          <div className={clsx({ invisible: !damagesToReceivers })}>
            <Label htmlFor="damage">{t("analyzer:labels.damageType")}</Label>
            <DamageTypesSelect
              handleChange={handleChange}
              subWeaponId={subWeaponId}
              damageType={damageType}
              allDamageTypes={allDamageTypes}
            />
          </div>
        </div>
        {multiShotCount ? (
          <div className="stack sm horizontal items-center label-no-spacing">
            <label className="plain" htmlFor="multi">
              ×{multiShotCount}
            </label>
            <Toggle
              id="multi"
              name="multi"
              checked={isMultiShot}
              setChecked={(checked) =>
                handleChange({ newIsMultiShot: checked })
              }
            />
          </div>
        ) : null}
      </div>
      {damagesToReceivers ? (
        <DamageReceiversGrid
          subWeaponId={subWeaponId}
          damagesToReceivers={damagesToReceivers}
          abilityPoints={abilityPoints}
        >
          <div>
            <select
              className="object-damage__select"
              id="ap"
              value={abilityPoints}
              onChange={(e) =>
                handleChange({ newAbilityPoints: Number(e.target.value) })
              }
            >
              {possibleApValues().map((ap) => (
                <option key={ap} value={ap}>
                  {ap}
                  {t("analyzer:abilityPoints.short")}
                </option>
              ))}
            </select>
          </div>
        </DamageReceiversGrid>
      ) : (
        <div>{t("analyzer:noDmgData")}</div>
      )}
      <div className="object-damage__bottom-container">
        <div className="text-lighter text-xs">
          {t("analyzer:dmgHtdExplanation")}
        </div>
        <div className="object-damage__patch">
          {t("analyzer:patch")} {CURRENT_PATCH}
        </div>
      </div>
    </Main>
  );
}

function DamageTypesSelect({
  allDamageTypes,
  handleChange,
  subWeaponId,
  damageType,
}: Pick<
  ReturnType<typeof useObjectDamage>,
  "handleChange" | "subWeaponId" | "damageType" | "allDamageTypes"
>) {
  const { t } = useTranslation(["analyzer"]);

  return (
    <select
      className="object-damage__select"
      id="damage"
      value={damageType}
      onChange={(e) =>
        handleChange({ newDamageType: e.target.value as DamageType })
      }
    >
      {allDamageTypes.map((damageType) => {
        return (
          <option key={damageType} value={damageType}>
            {t(
              damageTypeTranslationString({
                damageType,
                subWeaponId,
              })
            )}
          </option>
        );
      })}
    </select>
  );
}

const damageReceiverImages: Record<DamageReceiver, string> = {
  Bomb_TorpedoBullet: subWeaponImageUrl(TORPEDO_ID),
  Chariot: specialWeaponImageUrl(CRAB_TANK_ID),
  Gachihoko_Barrier: modeImageUrl("RM"),
  GreatBarrier_Barrier: specialWeaponImageUrl(BIG_BUBBLER_ID),
  GreatBarrier_WeakPoint: specialWeaponImageUrl(BIG_BUBBLER_ID),
  NiceBall_Armor: specialWeaponImageUrl(BOOYAH_BOMB_ID),
  ShockSonar: specialWeaponImageUrl(WAVE_BREAKER_ID),
  Wsb_Flag: subWeaponImageUrl(SQUID_BEAKON_ID),
  Wsb_Shield: subWeaponImageUrl(SPLASH_WALL_ID),
  Wsb_Sprinkler: subWeaponImageUrl(SPRINKLER_ID),
  BulletUmbrellaCanopyNormal: mainWeaponImageUrl(6000),
  BulletUmbrellaCanopyWide: mainWeaponImageUrl(6010),
  BulletUmbrellaCanopyCompact: mainWeaponImageUrl(6020),
};

const damageReceiverAp: Partial<Record<DamageReceiver, JSX.Element>> = {
  GreatBarrier_Barrier: (
    <Ability ability="SPU" size="TINY" className="object-damage__ability" />
  ),
  GreatBarrier_WeakPoint: (
    <Ability ability="SPU" size="TINY" className="object-damage__ability" />
  ),
  Wsb_Shield: (
    <Ability ability="BRU" size="TINY" className="object-damage__ability" />
  ),
};

function DamageReceiversGrid({
  subWeaponId,
  damagesToReceivers,
  children,
  abilityPoints,
}: {
  subWeaponId: ReturnType<typeof useObjectDamage>["subWeaponId"];
  damagesToReceivers: NonNullable<
    ReturnType<typeof useObjectDamage>["damagesToReceivers"]
  >;
  children: React.ReactNode;
  abilityPoints: string;
}): JSX.Element {
  const { t } = useTranslation(["weapons", "analyzer", "common"]);
  useSetTitle(t("common:pages.object-damage-calculator"));
  return (
    <div
      className="object-damage__grid"
      style={{
        gridTemplateColumns: gridTemplateColumnsValue(
          damagesToReceivers[0]?.damages.length ?? 0
        ),
      }}
    >
      <div>
        <Label htmlFor="ap">
          {t("analyzer:labels.amountOf")}
          <div className="object-damage__ap-label">
            <Ability ability="BRU" size="TINY" />
            <Ability ability="SPU" size="TINY" />
          </div>
        </Label>
      </div>
      <div>{children}</div>
      {damagesToReceivers[0]?.damages.map((damage) => (
        <div key={damage.id} className="object-damage__table-header">
          <div className="stack horizontal sm justify-center items-center">
            {t(
              damageTypeTranslationString({
                damageType: damage.type,
                subWeaponId: subWeaponId,
              })
            )}
            {damage.objectShredder && <Ability ability="OS" size="TINY" />}
          </div>
          <div
            className={clsx("object-damage__distance", {
              invisible: !damage.distance,
            })}
          >
            {t("analyzer:distanceInline", { value: damage.distance })}
          </div>
        </div>
      ))}
      {damagesToReceivers.map((damageToReceiver, i) => {
        return (
          <React.Fragment key={damageToReceiver.receiver}>
            <div>
              <Label htmlFor="ap">
                <div className="object-damage__ap-label">
                  {abilityPoints !== "0" &&
                    damageReceiverAp[damageToReceiver.receiver]}
                </div>
              </Label>
              <Image
                className="object-damage__receiver-image"
                key={i}
                alt=""
                path={damageReceiverImages[damageToReceiver.receiver]}
                width={40}
                height={40}
              />
            </div>
            <div className="object-damage__hp">
              <span data-testid={`hp-${damageToReceiver.receiver}`}>
                {damageToReceiver.hitPoints}
              </span>
              {t("analyzer:suffix.hp")}
            </div>
            {damageToReceiver.damages.map((damage) => {
              return (
                <div key={damage.id} className="object-damage__table-card">
                  <div className="object-damage__table-card__results">
                    <abbr
                      className="object-damage__abbr"
                      title={t("analyzer:stat.category.damage")}
                    >
                      {t("analyzer:damageShort")}
                    </abbr>
                    <div
                      data-testid={`dmg${damage.objectShredder ? "-os" : ""}-${
                        damageToReceiver.receiver
                      }`}
                    >
                      {damage.value}
                    </div>
                    <abbr
                      className="object-damage__abbr"
                      title={t("analyzer:hitsToDestroyLong")}
                    >
                      {t("analyzer:hitsToDestroyShort")}
                    </abbr>
                    <div
                      data-testid={`htd${damage.objectShredder ? "-os" : ""}-${
                        damageToReceiver.receiver
                      }`}
                    >
                      {damage.hitsToDestroy}
                    </div>
                  </div>
                  <div className="object-damage__multiplier">
                    ×{damage.multiplier}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function gridTemplateColumnsValue(dataColumnsCount: number) {
  return `max-content max-content ${new Array(dataColumnsCount)
    .fill(null)
    .map(() => `1fr`)
    .join(" ")}`;
}
