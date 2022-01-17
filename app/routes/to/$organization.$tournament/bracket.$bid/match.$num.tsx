import { json, LoaderFunction, useLoaderData, useLocation } from "remix";
import { z } from "zod";
import Modal from "~/components/Modal";
import {
  FindMatchModalInfoByNumber,
  findMatchModalInfoByNumber,
} from "~/db/tournament/queries/findMatchModalInfoByNumber";

const typedJson = (args: NonNullable<FindMatchModalInfoByNumber>) => json(args);

export const loader: LoaderFunction = async ({ params }) => {
  const { bid: bracketId, num: matchNumber } = z
    .object({ bid: z.string(), num: z.preprocess(Number, z.number()) })
    .parse(params);

  const match = await findMatchModalInfoByNumber({ bracketId, matchNumber });
  if (!match) throw new Response("No match found", { status: 400 });

  return typedJson(match);
};

export default function MatchModal() {
  const data = useLoaderData<NonNullable<FindMatchModalInfoByNumber>>();
  const location = useLocation();

  return (
    <Modal title={data.title} closeUrl={location.pathname.split("/match")[0]}>
      <h4>{data.roundName}</h4>
    </Modal>
  );
}
