import { tournamentIdFromParams } from "~/features/tournament";
import {
  type SubByTournamentId,
  findSubsByTournamentId,
} from "../queries/findSubsByTournamentId.server";
import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getUser } from "~/modules/auth";
import { assertUnreachable } from "~/utils/types";
import styles from "../tournament-subs.css";
import { Avatar } from "~/components/Avatar";
import { discordFullName } from "~/utils/strings";
import { userPage } from "~/utils/urls";
import { WeaponImage } from "~/components/Image";
import { Flag } from "~/components/Flag";
import type React from "react";
import { MicrophoneIcon } from "~/components/icons/Microphone";

export const links: LinksFunction = () => {
  return [
    {
      rel: "stylesheet",
      href: styles,
    },
  ];
};

export const loader = async ({ params, request }: LoaderArgs) => {
  const user = await getUser(request);

  const tournamentId = tournamentIdFromParams(params);

  return {
    subs: findSubsByTournamentId(tournamentId).filter((sub) => {
      if (sub.visibility === "ALL") return true;

      const userPlusTier = user?.plusTier ?? 4;

      switch (sub.visibility) {
        case "+1": {
          return userPlusTier === 1;
        }
        case "+2": {
          return userPlusTier <= 2;
        }
        case "+3": {
          return userPlusTier <= 3;
        }
        default: {
          assertUnreachable(sub.visibility);
        }
      }
    }),
  };
};

// xxx: handle visibility in count as well or later?
export default function TournamentSubsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="stack lg">
      {data.subs.map((sub) => {
        return <SubInfoSection key={sub.userId} sub={sub} />;
      })}
    </div>
  );
}

function SubInfoSection({ sub }: { sub: SubByTournamentId }) {
  const infos: React.ReactNode[] = [];
  if (sub.plusTier) {
    infos.push(<div key="plus">+{sub.plusTier}</div>);
  }
  if (sub.country) {
    infos.push(<Flag key="flag" countryCode={sub.country} tiny />);
  }
  infos.push(
    <div key="vc" className="sub__section__info__vc">
      <MicrophoneIcon />
      {sub.canVc ? "Can vc" : "No vc"}
    </div>
  );

  return (
    <section className="sub__section">
      <Avatar user={sub} size="sm" className="sub__section__avatar" />
      <Link to={userPage(sub)} className="sub__section__name">
        {discordFullName(sub)}
      </Link>
      <div className="sub__section__info">{infos}</div>
      <div className="sub__section__weapon-top-text sub__section__weapon-text">
        Prefers to play
      </div>
      <div className="sub__section__weapon-top-images sub__section__weapon-images">
        {sub.bestWeapons.map((wpn) => (
          <WeaponImage key={wpn} weaponSplId={wpn} size={32} variant="badge" />
        ))}
      </div>
      {sub.okWeapons ? (
        <>
          <div className="sub__section__weapon-bottom-text sub__section__weapon-text">
            Can play
          </div>
          <div className="sub__section__weapon-bottom-images sub__section__weapon-images">
            {sub.okWeapons.map((wpn) => (
              <WeaponImage
                key={wpn}
                weaponSplId={wpn}
                size={32}
                variant="badge"
              />
            ))}
          </div>
        </>
      ) : null}
      <div className="sub__section__message">{sub.message}</div>
    </section>
  );
}
