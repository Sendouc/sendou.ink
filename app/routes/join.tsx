import {
  ActionFunction,
  Form,
  json,
  LinksFunction,
  LoaderFunction,
  redirect,
  useLoaderData,
  useLocation,
  useNavigate,
  useTransition,
} from "remix";
import invariant from "tiny-invariant";
import { z } from "zod";
import { Button } from "~/components/Button";
import { Catcher } from "~/components/Catcher";
import { canPreAddToGroup } from "~/core/play/validators";
import * as LFGGroup from "~/models/LFGGroup.server";
import * as TrustRelationship from "~/models/TrustRelationship.server";
import styles from "~/styles/join.css";
import {
  getLogInUrl,
  getUser,
  parseRequestFormData,
  requireUser,
  validate,
} from "~/utils";
import { sendouQAddPlayersPage, sendouQFrontPage } from "~/utils/urls";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

const actionSchema = z.object({
  inviteCode: z.string().uuid(),
});

export const action: ActionFunction = async ({ request, context }) => {
  const data = await parseRequestFormData({
    request,
    schema: actionSchema,
  });
  const user = requireUser(context);

  const [groupToJoin, ownGroup] = await Promise.all([
    LFGGroup.findByInviteCode(data.inviteCode),
    LFGGroup.findActiveByMember(user),
  ]);

  validate(groupToJoin, "Invalid invite code");
  validate(canPreAddToGroup(groupToJoin), "Group is full");
  validate(!ownGroup, "User already in group");

  const captain = groupToJoin.members.find((m) => m.captain);
  invariant(captain, "Unexpected no captain");

  await Promise.all([
    LFGGroup.addMember({
      groupId: groupToJoin.id,
      userId: user.id,
    }),
    TrustRelationship.upsert({
      trustReceiverId: captain.memberId,
      trustGiverId: user.id,
    }),
  ]);

  return redirect(sendouQAddPlayersPage());
};

const INVITE_CODE_LENGTH = 36;

type Data =
  | { status: "NO_CODE" }
  | { status: "TOO_SHORT" }
  | { status: "LOG_IN" }
  | { status: "ALREADY_JOINED" }
  | { status: "INVALID" }
  | { status: "FULL" }
  | { status: "OK"; inviterName: string; inviteCode: string };

export const loader: LoaderFunction = async ({ request, context }) => {
  const user = getUser(context);

  if (!user) return json<Data>({ status: "LOG_IN" });

  const searchParams = new URL(request.url).searchParams;
  const inviteCode = searchParams.get("code");

  if (!inviteCode) return json<Data>({ status: "NO_CODE" });
  if (inviteCode.length !== INVITE_CODE_LENGTH) {
    return json<Data>({ status: "TOO_SHORT" });
  }

  const [group, ownGroup] = await Promise.all([
    LFGGroup.findByInviteCode(inviteCode),
    LFGGroup.findActiveByMember(user),
  ]);
  if (!group) return json<Data>({ status: "INVALID" });
  if (ownGroup) return json<Data>({ status: "ALREADY_JOINED" });
  if (!canPreAddToGroup(group)) return json<Data>({ status: "FULL" });

  const inviterName = group.members.find((m) => m.captain)?.user.discordName;
  invariant(inviterName, "Team has no captain");

  return json<Data>({
    status: "OK",
    inviteCode,
    inviterName,
  });
};

export default function JoinTeamPage() {
  const data = useLoaderData<Data>();

  return (
    <div className="text-center text-sm">
      <Contents data={data} />
    </div>
  );
}

function Contents({ data }: { data: Data }) {
  const location = useLocation();
  const navigate = useNavigate();
  const transition = useTransition();

  switch (data.status) {
    case "NO_CODE":
      return (
        <>
          No invite code provided in the URL. Please ask your group leader to
          double check the URL they gave you.
        </>
      );
    case "TOO_SHORT":
      return (
        <>
          The code provided in the URL is too short. Please ask your group
          leader to double check the URL they gave you.
        </>
      );
    case "INVALID":
      return (
        <>
          The code provided in the URL is invalid. Please ask your group leader
          to double check the URL they gave you.
        </>
      );
    case "FULL":
      return <>Can&apos;t join the team because it is full.</>;
    case "ALREADY_JOINED":
      return <>You can&apos;t join a new group while already in one.</>;
    case "LOG_IN":
      return (
        <form action={getLogInUrl(location)} method="post">
          <p className="button-text-paragraph">
            Please{" "}
            <Button type="submit" variant="minimal">
              log in
            </Button>{" "}
            to join this group.
          </p>
        </form>
      );
    case "OK":
      return (
        <div>
          <b>{data.inviterName}</b> invited you to join their SendouQ group.
          Accept invite?
          <Form method="post">
            <input type="hidden" name="inviteCode" value={data.inviteCode} />
            <div className="join__buttons">
              <Button
                type="submit"
                loadingText="Joining..."
                loading={transition.state !== "idle"}
              >
                Join
              </Button>
              {transition.state === "idle" && (
                <Button
                  variant="outlined"
                  type="button"
                  onClick={() => navigate(sendouQFrontPage())}
                >
                  Don&apos;t join
                </Button>
              )}
            </div>
          </Form>
        </div>
      );
    default: {
      const exhaustive: never = data;
      throw new Error(
        `Unexpected join team status code: ${JSON.stringify(exhaustive)}`
      );
    }
  }
}

export const CatchBoundary = Catcher;
