import { json, LoaderFunction, useLoaderData, useLocation } from "remix";
import { z } from "zod";
import Modal from "~/components/Modal";
import { TeamRosterInputs } from "~/components/tournament/TeamRosterInputs";
import {
  FindMatchModalInfoByNumber,
  findMatchModalInfoByNumber,
} from "~/db/tournament/queries/findMatchModalInfoByNumber";
import { Unpacked } from "~/utils";

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
    <Modal title={data.title} closeUrl={location.pathname.split("/match")[0]}>
      <h4>{data.roundName}</h4>
      {data.matchInfos
        .filter((matchInfo) => matchInfo.winner)
        .map((matchInfo) => {
          return (
            <TeamRosterInputs
              key={matchInfo.idForReact}
              teamUpper={matchInfo.teamUpper}
              teamLower={matchInfo.teamLower}
              checkedPlayers={matchInfoToCheckedPlayers(matchInfo)}
              setCheckedPlayers={() => null}
              setWinnerId={() => null}
            />
          );
        })}
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
