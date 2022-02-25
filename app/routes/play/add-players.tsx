import {
  ActionFunction,
  Form,
  json,
  LinksFunction,
  LoaderFunction,
  redirect,
  useLoaderData,
  useTransition,
} from "remix";
import { AddPlayers } from "~/components/AddPlayers";
import { Button } from "~/components/Button";
import * as LFGGroup from "~/models/LFGGroup.server";
import type { FindManyByTrustReceiverId } from "~/models/TrustRelationship.server";
import * as User from "~/models/User.server";
import { getUser, requireUser, validate } from "~/utils";
import styles from "~/styles/play-add-players.css";
import { isGroupAdmin } from "~/core/play/validators";
import invariant from "tiny-invariant";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const action: ActionFunction = async ({ context }) => {
  const user = requireUser(context);

  const group = await LFGGroup.findLookingByMember(user);
  validate(group, "Not a member of active group");
  validate(isGroupAdmin({ user, group }), "Not captain of the group");

  await LFGGroup.startLooking(group.id);

  return redirect("/play/looking");
};

interface AddPlayersLoaderData {
  inviteCode: string;
  trustingUsers: FindManyByTrustReceiverId;
}

export const loader: LoaderFunction = async ({ context }) => {
  const user = getUser(context);
  if (!user) return redirect("/play");

  const [ownGroup, trustingUsers] = await Promise.all([
    LFGGroup.findLookingByMember(user),
    User.findTrusters(user.id),
  ]);
  if (!ownGroup) return redirect("/play");
  if (ownGroup.status === "MATCH") {
    invariant(ownGroup.matchId, "Unexpected no matchId but status is MATCH");
    return redirect(`/play/match/${ownGroup.matchId}`);
  }
  if (ownGroup.status === "LOOKING") return redirect("/play/looking");

  return json<AddPlayersLoaderData>({
    inviteCode: ownGroup.inviteCode,
    trustingUsers,
  });
};

export default function PlayAddPlayersPage() {
  const data = useLoaderData<AddPlayersLoaderData>();
  const transition = useTransition();

  return (
    <div className="container">
      {/* <Alert type="info">
        Do you already have mates you will start looking with? Add them in this
        view before advancing. This is optional - you can start looking even by
        yourself.
      </Alert> */}
      <AddPlayers
        pathname="/play/join"
        inviteCode={data.inviteCode}
        trustingUsers={data.trustingUsers}
        addUserError={undefined}
        hiddenInputs={[]}
        tinyButtons
      />
      <div className="play-add-players__button-container">
        {/* TODO: or.... look for match */}
        <Form method="post">
          <Button type="submit" loading={transition.state !== "idle"}>
            Look for teammates
          </Button>
        </Form>
      </div>
    </div>
  );
}
