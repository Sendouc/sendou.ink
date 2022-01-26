import { ActionFunction, Form, LinksFunction, MetaFunction } from "remix";
import { z } from "zod";
import { LFGGroupSelector } from "~/components/play/LFGGroupSelector";
import styles from "~/styles/play.css";
import { makeTitle, parseRequestFormData, requireUser } from "~/utils";
import * as LFGGroup from "~/models/LFGGroup.server";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

const playActionSchema = z.object({
  _action: z.literal("CREATE_LFG_GROUP"),
  type: z.enum(["VERSUS-RANKED", "VERSUS-UNRANKED", "TWIN", "QUAD"]),
});

type ActionData = {
  ok?: z.infer<typeof playActionSchema>["_action"];
};

export const action: ActionFunction = async ({
  request,
  context,
}): Promise<ActionData> => {
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
      await LFGGroup.create({
        user,
        type: getType(),
        ranked: getRanked(),
      });

      return { ok: "CREATE_LFG_GROUP" };
    }
    default: {
      const exhaustive: never = data._action;
      throw new Response(`Unknown action: ${JSON.stringify(exhaustive)}`, {
        status: 400,
      });
    }
  }
};

export const meta: MetaFunction = () => {
  return {
    title: makeTitle("Play!"),
  };
};

// TODO: loader: redirect to /lfg if active LFGGroup
//               redirect to /match if active LFGGroup AND match

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
