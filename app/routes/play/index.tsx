import { ActionFunction, Form, LinksFunction, MetaFunction } from "remix";
import { z } from "zod";
import { LFGGroupSelector } from "~/components/play/LFGGroupSelector";
import styles from "~/styles/play.css";
import { makeTitle, parseRequestFormData } from "~/utils";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

const playActionSchema = z.object({
  _action: z.literal("START_LOOKING"),
  type: z.enum(["VERSUS-RANKED", "VERSUS-UNRANKED", "TWIN", "QUAD"]),
});

type ActionData = {
  ok?: z.infer<typeof playActionSchema>["_action"];
};

export const action: ActionFunction = async ({
  request,
}): Promise<ActionData> => {
  const data = await parseRequestFormData({
    request,
    schema: playActionSchema,
  });
  switch (data._action) {
    case "START_LOOKING": {
      // const getRanked = () => {
      //   if (!data.type.startsWith("VERSUS")) return null;
      //   return data.type.includes("UNRANKED") ? 0 : 1;
      // };
      // const getType = () => {
      //   switch (data.type) {
      //     case "VERSUS-RANKED":
      //     case "VERSUS-UNRANKED":
      //       return "VERSUS";
      //     case "QUAD":
      //     case "TWIN":
      //       return data.type;
      //   }
      // };

      // db.LFGGroup.create({
      //   active: 1,
      //   message: "",
      //   ranked: getRanked(),
      //   type: getType(),
      // });
      return { ok: "START_LOOKING" };
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
        <input type="hidden" name="_action" value="START_LOOKING" />
        <LFGGroupSelector />
        <button type="submit">Submit</button>
      </Form>
    </div>
  );
}
