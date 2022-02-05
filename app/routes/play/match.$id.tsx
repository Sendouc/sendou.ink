import {
  ActionFunction,
  Form,
  json,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
  redirect,
  useLoaderData,
  useTransition,
} from "remix";
import invariant from "tiny-invariant";
import { z } from "zod";
import { Avatar } from "~/components/Avatar";
import { Button } from "~/components/Button";
import { DISCORD_URL } from "~/constants";
import * as LFGGroup from "~/models/LFGGroup.server";
import * as LFGMatch from "~/models/LFGMatch.server";
import styles from "~/styles/play-match.css";
import {
  getUser,
  listToUserReadableString,
  makeTitle,
  parseRequestFormData,
  requireUser,
  UserLean,
  validate,
} from "~/utils";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = ({ data }: { data: LFGMatchLoaderData }) => {
  return {
    title: data.isOwnMatch
      ? makeTitle(
          `vs. ${listToUserReadableString(
            data.groups[1].map(
              (u) => `${u.discordName}#${u.discordDiscriminator}`
            )
          )}`
        )
      : "Match",
  };
};

const matchActionSchema = z.union([
  z.object({
    _action: z.literal("LOOK_AGAIN"),
  }),
  z.object({
    _action: z.literal("PLACEHOLDER"),
  }),
]);

export const action: ActionFunction = async ({ request, context }) => {
  const data = await parseRequestFormData({
    request,
    schema: matchActionSchema,
  });
  const user = requireUser(context);

  const ownGroup = await LFGGroup.findActiveByMember(user);
  validate(ownGroup, "No active group");

  switch (data._action) {
    case "PLACEHOLDER":
    case "LOOK_AGAIN": {
      validate(!ownGroup.ranked, "Score reporting required");
      await LFGGroup.setInactive(ownGroup.id);
      return redirect("/play");
    }
    default: {
      const exhaustive: never = data;
      throw new Response(`Unknown action: ${JSON.stringify(exhaustive)}`, {
        status: 400,
      });
    }
  }

  return { ok: data._action };

  // TODO: notify watchers
};

interface LFGMatchLoaderData {
  /** Can the user counterpick and report scores? */
  isCaptain: boolean;
  isOwnMatch: boolean;
  isRanked: boolean;
  groups: UserLean[][];
}

export const loader: LoaderFunction = async ({ params, context }) => {
  invariant(typeof params.id === "string", "Expected params.bid to be string");
  const user = getUser(context);

  const match = await LFGMatch.findById(params.id);
  if (!match || match.groups.length === 0) {
    throw new Response(null, { status: 404 });
  }

  const isRanked = match.groups.every((g) => g.ranked);
  const isOwnMatch = match.groups.some((g) =>
    g.members.some((m) => user?.id === m.user.id)
  );
  // Non-ranked matches are only of interest to participants
  if (!isRanked && !isOwnMatch) {
    throw new Response(null, { status: 404 });
  }

  const isCaptain = match.groups.some((g) =>
    g.members.some((m) => m.user.id === user?.id && m.captain)
  );
  return json<LFGMatchLoaderData>({
    isCaptain,
    isRanked,
    isOwnMatch,
    groups: match.groups
      .sort((a, b) => {
        const aIsOwnGroup = a.members.some((m) => user?.id === m.user.id);
        const bIsOwnGroup = b.members.some((m) => user?.id === m.user.id);

        return Number(bIsOwnGroup) - Number(aIsOwnGroup);
      })
      .map((g) => {
        return g.members.map((g) => ({
          id: g.user.id,
          discordId: g.user.discordId,
          discordAvatar: g.user.discordAvatar,
          discordName: g.user.discordName,
          discordDiscriminator: g.user.discordDiscriminator,
        }));
      }),
  });
};

export default function LFGMatchPage() {
  const data = useLoaderData<LFGMatchLoaderData>();
  const transition = useTransition();

  return (
    <div className="container">
      <div className="play-match__waves">
        <div className="play-match__teams">
          {data.groups.map((g, i) => {
            return (
              <div
                key={i}
                className="play-match__waves-section play-match__players"
              >
                {g.map((user) => (
                  <div key={user.id} className="play-match__player">
                    <Avatar user={user} />
                    <span className="play-match__player-name">
                      {user.discordName}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        {!data.isRanked && (
          <div className="play-match__waves-section play-match__info">
            This is your match! You can reach out to your opponents{" "}
            <a href={DISCORD_URL}>our Discord</a> in the{" "}
            <code>#match-meetup</code> channel.
          </div>
        )}
      </div>
      {!data.isRanked && (
        <div className="play-match__waves-button">
          <Form method="post">
            {data.isCaptain && (
              <Button
                type="submit"
                name="_action"
                value="LOOK_AGAIN"
                tiny
                variant="outlined"
                loading={transition.state !== "idle"}
              >
                Look again
              </Button>
            )}
          </Form>
        </div>
      )}
    </div>
  );
}
