import {
  ActionFunction,
  Form,
  json,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
  redirect,
  useLoaderData,
  useLocation,
  useTransition,
} from "remix";
import { z } from "zod";
import { Button } from "~/components/Button";
import { LFGGroupSelector } from "~/components/play/LFGGroupSelector";
import { resolveRedirect } from "~/core/play/utils";
import { db } from "~/db";
import { RelativeOwnSP } from "~/db/services/skills";
import { useUser } from "~/hooks/common";
import * as LFGGroup from "~/models/LFGGroup.server";
import styles from "~/styles/play.css";
import {
  getLogInUrl,
  getUser,
  makeTitle,
  parseRequestFormData,
  requireUser,
  validate,
} from "~/utils";
import { sendouQAddPlayersPage, sendouQLookingPage } from "~/utils/urls";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

// TODO: Switch to layout component
export const meta: MetaFunction = () => {
  return {
    title: makeTitle("Play!"),
  };
};

const playActionSchema = z.object({
  _action: z.literal("CREATE_LFG_GROUP"),
  type: z.enum(["VERSUS-RANKED", "VERSUS-UNRANKED", "TWIN", "QUAD"]),
});

export const action: ActionFunction = async ({ request, context }) => {
  const data = await parseRequestFormData({
    request,
    schema: playActionSchema,
  });
  const user = requireUser(context);

  const ids = await LFGGroup.activeUserIds();
  validate(!ids.has(user.id), "Already in an active group");

  switch (data._action) {
    case "CREATE_LFG_GROUP": {
      const getRanked = () => {
        if (!data.type.startsWith("VERSUS")) return;
        return data.type.includes("UNRANKED") ? false : true;
      };
      const getType = () => {
        switch (data.type) {
          case "VERSUS-RANKED":
          case "VERSUS-UNRANKED":
            return "VERSUS";
          case "QUAD":
          case "TWIN":
            return data.type;
        }
      };
      const group = await LFGGroup.create({
        user,
        type: getType(),
        ranked: getRanked(),
      });

      if (group.status === "LOOKING") {
        return redirect(sendouQLookingPage());
      }

      return redirect(sendouQAddPlayersPage());
    }
    default: {
      const exhaustive: never = data._action;
      throw new Response(`Unknown action: ${JSON.stringify(exhaustive)}`, {
        status: 400,
      });
    }
  }
};

export interface PlayFrontPageLoader {
  counts: Record<"TWIN" | "QUAD" | "VERSUS", number>;
  skill: RelativeOwnSP;
}

export const loader: LoaderFunction = async ({ context }) => {
  const user = getUser(context);

  const [ownGroup, skill] = await Promise.all([
    db.groups.ownGroupStatus({ id: 1 }),
    db.skills.relativeOwnSP({ id: 1 }),
  ]);

  if (!user || !ownGroup?.status) {
    return json<PlayFrontPageLoader>({
      //counts: countGroups(groups),
      counts: { TWIN: 0, QUAD: 0, VERSUS: 0 },
      skill,
    });
  }

  const redirectRes = resolveRedirect({
    currentStatus: ownGroup.status,
    currentPage: "INACTIVE",
    matchId: ownGroup.matchId,
  });
  if (redirectRes) return redirectRes;

  throw new Error(`Unexpected state - group status: ${ownGroup.status}`);
};

export default function PlayPage() {
  const data = useLoaderData<PlayFrontPageLoader>();

  return (
    <div>
      {data.skill && (
        <div className="play__own-mmr">
          <div className="play__own-mmr__mmr">SP: {data.skill.sp}</div>
          {data.skill.topX && (
            <div className="play__own-mmr__topx">
              Top {data.skill.topX}% (better than {100 - data.skill.topX}% of
              players)
            </div>
          )}
        </div>
      )}
      <Form method="post">
        <input type="hidden" name="_action" value="CREATE_LFG_GROUP" />
        <LFGGroupSelector counts={data.counts} />
        <QueueUp />
      </Form>
    </div>
  );
}

function QueueUp() {
  const user = useUser();
  const location = useLocation();
  const transition = useTransition();

  const isSubmitting = () => {
    if (transition.state === "submitting") return true;
    if (
      transition.state === "loading" &&
      transition.type === "actionRedirect"
    ) {
      return true;
    }

    return false;
  };

  if (!user) {
    return (
      <form action={getLogInUrl(location)} method="post">
        <p className="button-text-paragraph play__action-needed">
          To start looking first{" "}
          <Button type="submit" variant="minimal">
            log in
          </Button>
        </p>
      </form>
    );
  }

  return (
    <Button
      className="play__continue-button"
      type="submit"
      loading={isSubmitting()}
      loadingText="Continuing..."
    >
      Continue
    </Button>
  );
}
