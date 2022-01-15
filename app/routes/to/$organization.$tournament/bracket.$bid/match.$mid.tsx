import { json, LoaderFunction, useLoaderData, useLocation } from "remix";
import invariant from "tiny-invariant";
import Modal from "~/components/Modal";
import { matchById } from "~/services/bracket";
import type { MatchByIdI } from "~/services/bracket";
import { Serialized } from "~/utils";

const typedJson = (args: MatchByIdI) => json(args);

export const loader: LoaderFunction = async ({ params }) => {
  invariant(typeof params.mid === "string", "Expected params.mid to be string");

  const match = await matchById(params.mid);
  return typedJson(match);
};

export default function MatchModal() {
  const data = useLoaderData<Serialized<MatchByIdI>>();
  const location = useLocation();

  const teamVersusTitle = (): string => {
    const teamsOrdered = data.participants.sort((a, b) =>
      b.order.localeCompare(a.order)
    );

    return `${teamsOrdered[0].team.name} vs. ${teamsOrdered[1].team.name}`;
  };

  return (
    <Modal
      title={teamVersusTitle()}
      closeUrl={location.pathname.split("/match")[0]}
    >
      asdasd
    </Modal>
  );
}
