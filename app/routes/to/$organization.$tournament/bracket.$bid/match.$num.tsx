import {
  json,
  LinksFunction,
  LoaderFunction,
  useLoaderData,
  useLocation,
} from "remix";
import { z } from "zod";
import Modal from "~/components/Modal";
import { TeamRosterInputs } from "~/components/tournament/TeamRosterInputs";
import {
  FindMatchModalInfoByNumber,
  findMatchModalInfoByNumber,
} from "~/db/tournament/queries/findMatchModalInfoByNumber";
import { Unpacked } from "~/utils";
import styles from "~/styles/tournament-match.css";
import { FancyStageBanner } from "~/components/tournament/FancyStageBanner";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

const typedJson = (args: NonNullable<FindMatchModalInfoByNumber>) => json(args);

export const loader: LoaderFunction = async ({ params }) => {
  const { bid: bracketId, num: matchNumber } = z
    .object({ bid: z.string(), num: z.preprocess(Number, z.number()) })
    .parse(params);

  const match = await findMatchModalInfoByNumber({ bracketId, matchNumber });
  if (!match) throw new Response("No match found", { status: 404 });

  return typedJson(match);
};

export default function MatchModal() {
  const data = useLoaderData<NonNullable<FindMatchModalInfoByNumber>>();
  const location = useLocation();

  return (
    <Modal
      title={
        <div>
          <span className="tournament-match-modal__vs-title">{data.title}</span>{" "}
          <span className="tournament-match-modal__score-title">
            {data.scoreTitle}
          </span>
        </div>
      }
      closeUrl={location.pathname.split("/match")[0]}
    >
      <h4 className="tournament-match-modal__round-name">{data.roundName}</h4>
      <div className="tournament-match-modal__rounds">
        {data.matchInfos
          .filter((matchInfo) => matchInfo.winnerId)
          .map((matchInfo, i) => {
            return (
              <div
                className="tournament-match-modal__round"
                key={matchInfo.idForFrontend}
              >
                <FancyStageBanner stage={matchInfo.stage} roundNumber={i + 1} />
                <TeamRosterInputs
                  teamUpper={matchInfo.teamUpper}
                  teamLower={matchInfo.teamLower}
                  checkedPlayers={matchInfoToCheckedPlayers(matchInfo)}
                  setCheckedPlayers={() => null}
                  setWinnerId={() => null}
                  winnerId={matchInfo.winnerId}
                  presentational
                />
              </div>
            );
          })}
      </div>
    </Modal>
  );
}

function matchInfoToCheckedPlayers(
  matchInfo: Unpacked<NonNullable<FindMatchModalInfoByNumber>["matchInfos"]>
): [string[], string[]] {
  return [
    matchInfo.teamUpper.members
      .filter((m) => m.member.played)
      .map((m) => m.member.id),
    matchInfo.teamLower.members
      .filter((m) => m.member.played)
      .map((m) => m.member.id),
  ];
}
