import {
  ActionFunction,
  Form,
  json,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
  redirect,
  useLoaderData,
} from "remix";
import { AddPlayers } from "~/components/AddPlayers";
import { Button } from "~/components/Button";
import * as LFGGroup from "~/models/LFGGroup.server";
import type { FindManyByTrustReceiverId } from "~/models/TrustRelationship.server";
import * as User from "~/models/User.server";
import {
  getUser,
  makeTitle,
  parseRequestFormData,
  requireUser,
  validate,
} from "~/utils";
import styles from "~/styles/play-add-players.css";
import {
  canPreAddToGroup,
  isGroupAdmin,
  userIsNotInGroup,
} from "~/core/play/validators";
import invariant from "tiny-invariant";
import { z } from "zod";
import { usePolling } from "~/hooks/common";
import { GroupCard } from "~/components/play/GroupCard";
import { LookingLoaderDataGroup } from "./looking";
import { sendouQFrontPage } from "~/utils/urls";
import { Alert } from "~/components/Alert";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = () => {
  return {
    title: makeTitle("Pre-add players"),
  };
};

const preAddPlayersActionSchema = z.union([
  z.object({
    _action: z.literal("JOIN_QUEUE"),
  }),
  z.object({
    _action: z.literal("ADD_PLAYER"),
    userId: z.string().uuid(),
  }),
  z.object({
    _action: z.literal("CANCEL"),
  }),
  z.object({
    _action: z.literal("LEAVE_GROUP"),
  }),
]);

export const action: ActionFunction = async ({ context, request }) => {
  const user = requireUser(context);
  const data = await parseRequestFormData({
    request,
    schema: preAddPlayersActionSchema,
  });

  const { groups, ownGroup } = await LFGGroup.findLookingAndOwnActive(user.id);
  validate(ownGroup, "Not a member of active group");

  switch (data._action) {
    case "JOIN_QUEUE": {
      validate(
        isGroupAdmin({ user, group: ownGroup }),
        "Not captain of the group"
      );
      await LFGGroup.startLooking(ownGroup.id);
      return redirect("/play/looking");
    }
    case "ADD_PLAYER": {
      validate(canPreAddToGroup(ownGroup), "Group is full");
      validate(
        userIsNotInGroup({ userId: data.userId, groups }),
        "User already in group"
      );
      validate(
        isGroupAdmin({ user, group: ownGroup }),
        "Not captain of the group"
      );
      await LFGGroup.addMember({ groupId: ownGroup.id, userId: data.userId });
      break;
    }
    case "LEAVE_GROUP": {
      await LFGGroup.leaveGroup({ memberId: user.id, groupId: ownGroup.id });
      return redirect("/play");
    }
    case "CANCEL": {
      validate(
        isGroupAdmin({ user, group: ownGroup }),
        "Not captain of the group"
      );
      await LFGGroup.setInactive(ownGroup.id);
      return redirect(sendouQFrontPage());
    }
    default: {
      const exhaustive: never = data;
      throw new Response(`Unknown action: ${JSON.stringify(exhaustive)}`, {
        status: 400,
      });
    }
  }

  return null;
};

interface AddPlayersLoaderData {
  inviteCode: string;
  trustingUsers: FindManyByTrustReceiverId;
  group: LookingLoaderDataGroup;
  isCaptain: boolean;
}

export const loader: LoaderFunction = async ({ context }) => {
  const user = getUser(context);
  if (!user) return redirect("/play");

  const [{ ownGroup, groups }, trustingUsers] = await Promise.all([
    LFGGroup.findLookingAndOwnActive(user.id),
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
    trustingUsers: trustingUsers.filter((u) =>
      userIsNotInGroup({ groups, userId: u.trustGiver.id })
    ),
    group: {
      id: ownGroup.id,
      ranked: ownGroup.ranked ?? undefined,
      members: ownGroup.members.map((m) => ({
        discordAvatar: m.user.discordAvatar,
        discordId: m.user.discordId,
        discordDiscriminator: m.user.discordDiscriminator,
        discordName: m.user.discordName,
        id: m.memberId,
      })),
    },
    isCaptain: isGroupAdmin({ group: ownGroup, user }),
  });
};

export default function PlayAddPlayersPage() {
  const data = useLoaderData<AddPlayersLoaderData>();
  usePolling();

  return (
    <div className="container play-add-players__container">
      <GroupCard
        group={data.group}
        showAction={!data.isCaptain}
        action="LEAVE_GROUP"
      />
      {data.isCaptain ? (
        <>
          <AddPlayers
            pathname="/join"
            inviteCode={data.inviteCode}
            trustingUsers={data.trustingUsers}
            addUserError={undefined}
            hiddenInputs={[
              { name: "groupId", value: data.group.id },
              { name: "_action", value: "ADD_PLAYER" },
            ]}
            tinyButtons
            legendText="Pre-add players to your group (optional)"
          />
          <Form method="post">
            <div className="play-add-players__button-container">
              <Button name="_action" value="JOIN_QUEUE" type="submit">
                Join the queue
              </Button>
              <Button
                name="_action"
                value="CANCEL"
                type="submit"
                variant="destructive"
              >
                Cancel
              </Button>
            </div>
          </Form>
        </>
      ) : (
        <Alert type="info">Your group leader is adding players</Alert>
      )}
    </div>
  );
}
