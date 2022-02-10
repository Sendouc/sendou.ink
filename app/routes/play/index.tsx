import {
  ActionFunction,
  Form,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
  redirect,
  useLocation,
  useTransition,
} from "remix";
import { z } from "zod";
import { LFGGroupSelector } from "~/components/play/LFGGroupSelector";
import styles from "~/styles/play.css";
import {
  getLogInUrl,
  getUser,
  makeTitle,
  parseRequestFormData,
  requireUser,
} from "~/utils";
import * as LFGGroup from "~/models/LFGGroup.server";
import { Button } from "~/components/Button";
import { useUser } from "~/hooks/common";

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

      if (group.looking) {
        return redirect("/play/looking");
      }

      return redirect("/play/add-players");
    }
    default: {
      const exhaustive: never = data._action;
      throw new Response(`Unknown action: ${JSON.stringify(exhaustive)}`, {
        status: 400,
      });
    }
  }
};

export const loader: LoaderFunction = async ({ context }) => {
  const user = getUser(context);
  // TODO: show something reasonable when user not logged in
  if (!user) return null;

  const ownGroup = await LFGGroup.findActiveByMember(user);
  if (!ownGroup) return null;
  if (ownGroup.matchId) return redirect(`/play/match/${ownGroup.matchId}`);
  if (ownGroup.looking) return redirect("/play/looking");

  return redirect("/play/add-players");
};

export default function PlayPage() {
  const transition = useTransition();
  const user = useUser();
  const location = useLocation();

  return (
    <div className="container">
      <Form method="post">
        <input type="hidden" name="_action" value="CREATE_LFG_GROUP" />
        <LFGGroupSelector />
        {user ? (
          <Button
            className="play__continue-button"
            type="submit"
            loading={transition.state !== "idle"}
            loadingText="Continuing..."
          >
            Continue
          </Button>
        ) : (
          <form action={getLogInUrl(location)} method="post">
            <p className="button-text-paragraph play__log-in">
              To start looking first{" "}
              <Button type="submit" variant="minimal">
                log in
              </Button>
            </p>
          </form>
        )}
      </Form>
    </div>
  );
}
