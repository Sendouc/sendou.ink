import {
  ActionFunction,
  Form,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
  redirect,
} from "remix";
import { z } from "zod";
import { LFGGroupSelector } from "~/components/play/LFGGroupSelector";
import styles from "~/styles/play.css";
import { getUser, makeTitle, parseRequestFormData, requireUser } from "~/utils";
import * as LFGGroup from "~/models/LFGGroup.server";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

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

  const group = await LFGGroup.findActiveByMember(user);
  if (!group) return null;

  if (group.looking) {
    return redirect("/play/looking");
  }

  // TODO: else if matchId -> redirect to /match

  return redirect("/play/add-players");
};

export default function PlayPage() {
  return (
    <div className="container">
      <Form method="post">
        <input type="hidden" name="_action" value="CREATE_LFG_GROUP" />
        <LFGGroupSelector />
        <button type="submit">Submit</button>
      </Form>
    </div>
  );
}
