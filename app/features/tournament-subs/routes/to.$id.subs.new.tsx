import {
  redirect,
  type ActionFunction,
  type LinksFunction,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import React from "react";
import { Label } from "~/components/Label";
import { SubmitButton } from "~/components/SubmitButton";
import { useTranslation } from "~/hooks/useTranslation";
import styles from "../tournament-subs.css";
import { requireUser, useUser } from "~/features/auth/core";
import type { MainWeaponId } from "~/modules/in-game-lists";
import { WeaponCombobox } from "~/components/Combobox";
import { TOURNAMENT_SUB } from "../tournament-subs-constants";
import { WeaponImage } from "~/components/Image";
import { Button } from "~/components/Button";
import { TrashIcon } from "~/components/icons/Trash";
import { findSubsByTournamentId } from "../queries/findSubsByTournamentId.server";
import { tournamentIdFromParams } from "~/features/tournament";
import { parseRequestFormData, type SendouRouteHandle } from "~/utils/remix";
import { FormMessage } from "~/components/FormMessage";
import { subSchema } from "../tournament-subs-schemas.server";
import { upsertSub } from "../queries/upsertSub.server";
import { tournamentSubsPage } from "~/utils/urls";

export const handle: SendouRouteHandle = {
  i18n: ["user"],
};

export const links: LinksFunction = () => {
  return [
    {
      rel: "stylesheet",
      href: styles,
    },
  ];
};

export const action: ActionFunction = async ({ params, request }) => {
  const user = await requireUser(request);
  const data = await parseRequestFormData({
    request,
    schema: subSchema,
  });
  const tournamentId = tournamentIdFromParams(params);

  // TODO: validate tournament is not finalized

  upsertSub({
    bestWeapons: data.bestWeapons.join(","),
    okWeapons: data.okWeapons.join(","),
    canVc: data.canVc,
    visibility: data.visibility,
    message: data.message ?? null,
    tournamentId,
    userId: user.id,
  });

  throw redirect(tournamentSubsPage(tournamentId));
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  const tournamentId = tournamentIdFromParams(params);

  const sub = findSubsByTournamentId({ tournamentId }).find(
    (sub) => sub.userId === user.id,
  );

  return {
    sub,
  };
};

export default function NewTournamentSubPage() {
  const user = useUser();
  const { t } = useTranslation(["common", "tournament"]);
  const data = useLoaderData<typeof loader>();
  const [bestWeapons, setBestWeapons] = React.useState<MainWeaponId[]>(
    data.sub?.bestWeapons ?? [],
  );
  const [okWeapons, setOkWeapons] = React.useState<MainWeaponId[]>(
    data.sub?.okWeapons ?? [],
  );

  return (
    <div className="half-width">
      <Form method="post" className="stack md items-start">
        <h2>{t("tournament:subs.addPost")}</h2>
        <VCRadios />
        <WeaponPoolSelect
          label={t("tournament:subs.weapons.prefer.header")}
          weapons={bestWeapons}
          otherWeapons={okWeapons}
          setWeapons={setBestWeapons}
          id="bestWeapons"
          infoText={t("tournament:subs.weapons.info", {
            min: 1,
            max: TOURNAMENT_SUB.WEAPON_POOL_MAX_SIZE,
          })}
          required
        />
        <WeaponPoolSelect
          label={t("tournament:subs.weapons.ok.header")}
          weapons={okWeapons}
          otherWeapons={bestWeapons}
          setWeapons={setOkWeapons}
          id="okWeapons"
          infoText={t("tournament:subs.weapons.info", {
            min: 0,
            max: TOURNAMENT_SUB.WEAPON_POOL_MAX_SIZE,
          })}
        />
        <Message />
        {user?.plusTier ? <VisibilityRadios /> : null}
        <SubmitButton>{t("common:actions.save")}</SubmitButton>
      </Form>
    </div>
  );
}

function VCRadios() {
  const { t } = useTranslation(["common", "tournament"]);
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <Label required>{t("tournament:subs.vc.header")}</Label>
      <div className="stack xs">
        <div className="stack horizontal sm items-center">
          <input
            type="radio"
            id="vc-true"
            name="canVc"
            value="on"
            required
            defaultChecked={data.sub && Boolean(data.sub.canVc)}
          />
          <label htmlFor="vc-true" className="mb-0">
            {t("common:yes")}
          </label>
        </div>
        <div className="stack horizontal sm items-center">
          <input
            type="radio"
            id="vc-false"
            name="canVc"
            value="off"
            defaultChecked={data.sub && !data.sub.canVc}
          />
          <label htmlFor="vc-false" className="mb-0">
            {t("common:no")}
          </label>
        </div>
      </div>
    </div>
  );
}

function Message() {
  const { t } = useTranslation(["tournament"]);
  const data = useLoaderData<typeof loader>();
  const [value, setValue] = React.useState(data.sub?.message ?? "");

  return (
    <div className="u-edit__bio-container">
      <Label
        htmlFor="message"
        valueLimits={{
          current: value.length,
          max: TOURNAMENT_SUB.MESSAGE_MAX_LENGTH,
        }}
      >
        {t("tournament:subs.message.header")}
      </Label>
      <textarea
        id="message"
        name="message"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={TOURNAMENT_SUB.MESSAGE_MAX_LENGTH}
      />
    </div>
  );
}

function VisibilityRadios() {
  const { t } = useTranslation(["tournament"]);
  const data = useLoaderData<typeof loader>();
  const user = useUser();

  const userPlusTier = user?.plusTier ?? 4;

  return (
    <div>
      <Label required>{t("tournament:subs.visibility.header")}</Label>
      <div className="stack xs">
        {[1, 2, 3]
          .filter((tier) => tier >= userPlusTier)
          .map((tier) => {
            const id = `+${tier}`;

            return (
              <div key={tier} className="stack horizontal sm items-center">
                <input
                  type="radio"
                  id={id}
                  name="visibility"
                  value={id}
                  defaultChecked={data.sub?.visibility === id}
                />
                <label htmlFor={id} className="mb-0">
                  +{tier} {tier !== 1 && <>(and above)</>}
                </label>
              </div>
            );
          })}
        <div className="stack horizontal sm items-center">
          <input
            type="radio"
            id="all"
            name="visibility"
            value="ALL"
            required
            defaultChecked={data.sub?.visibility === "ALL"}
          />
          <label htmlFor="all" className="mb-0">
            {t("tournament:subs.visibility.everyone")}
          </label>
        </div>
      </div>
    </div>
  );
}

function WeaponPoolSelect({
  weapons,
  otherWeapons,
  setWeapons,
  label,
  id,
  infoText,
  required = false,
}: {
  weapons: Array<MainWeaponId>;
  otherWeapons: Array<MainWeaponId>;
  setWeapons: (weapons: Array<MainWeaponId>) => void;
  label: string;
  id: string;
  infoText: string;
  required?: boolean;
}) {
  const { t } = useTranslation(["user"]);

  return (
    <div className="stack md sub__weapon-pool">
      <input type="hidden" name={id} value={JSON.stringify(weapons)} />
      <div>
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
        {weapons.length < TOURNAMENT_SUB.WEAPON_POOL_MAX_SIZE ? (
          <>
            <WeaponCombobox
              inputName={id}
              id={id}
              onChange={(weapon) => {
                if (!weapon) return;
                setWeapons([...weapons, Number(weapon.value) as MainWeaponId]);
              }}
              // empty on selection
              key={weapons[weapons.length - 1]}
              weaponIdsToOmit={new Set([...weapons, ...otherWeapons])}
              fullWidth
            />
            <FormMessage type="info">{infoText}</FormMessage>
          </>
        ) : (
          <span className="text-xs text-warning">
            {t("user:forms.errors.maxWeapons")}
          </span>
        )}
      </div>
      {weapons.length > 0 ? (
        <div className="stack horizontal sm justify-center">
          {weapons.map((weapon) => {
            return (
              <div key={weapon} className="stack xs">
                <div className="sub__selected-weapon">
                  <WeaponImage
                    weaponSplId={weapon}
                    variant="badge"
                    width={38}
                    height={38}
                  />
                </div>
                <Button
                  icon={<TrashIcon />}
                  variant="minimal-destructive"
                  aria-label="Delete weapon"
                  onClick={() =>
                    setWeapons(weapons.filter((w) => w !== weapon))
                  }
                />
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
