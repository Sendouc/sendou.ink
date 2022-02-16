import type { Express, Response } from "express";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { BracketModified } from "~/services/bracket";
import type { Unpacked } from "~/utils";

export type BracketData = {
  number: Unpacked<Unpacked<BracketModified["rounds"]>["matches"]>["number"];
  participants:
    | Unpacked<Unpacked<BracketModified["rounds"]>["matches"]>["participants"]
    | null;
  score:
    | Unpacked<Unpacked<BracketModified["rounds"]>["matches"]>["score"]
    | null;
}[];

export type GroupLikeData =
  | {
      matchId: string;
      action: "MATCH_UP";
    }
  | {
      action: "UNITE_GROUPS";
    }
  | {
      groupId: string;
      action: "LIKE" | "UNLIKE";
    };

type BracketEventCollection<T> = {
  id: string;
  event: (data: T) => void;
}[];

export interface EventTargetRecorder {
  bracket: {
    [bracketId: string]: BracketEventCollection<BracketData>;
  };
  lfg: {
    likes: {
      [groupId: string]: BracketEventCollection<GroupLikeData>;
    };
  };
}

export type SSETarget = z.infer<typeof TargetSchema>;
const TargetSchema = z.union([
  z.object({
    type: z.literal("bracket"),
    bracketId: z.string(),
  }),
  z.object({
    type: z.literal("likes"),
    groupId: z.string(),
  }),
]);

export function setUpEvents(app: Express, events: EventTargetRecorder): void {
  // https://stackoverflow.com/a/59041709
  app.get("/events", (req, res) => {
    const target = TargetSchema.parse(req.query);

    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Connection", "keep-alive");

    // https://stackoverflow.com/a/69938612
    // Without this Express compression prevents any messages from being
    // sent until `res.end()` is called
    res.setHeader("Cache-Control", "no-cache, no-transform");

    res.flushHeaders();

    const id = uuidv4();
    eventsArray().push({
      id,
      event: (data: unknown) => sendEvent({ res, data }),
    });

    res.on("close", () => {
      filterInPlace(eventsArray(), (elem) => elem.id !== id);
      res.end();
    });

    function eventsArray() {
      switch (target.type) {
        case "bracket": {
          const result = events.bracket[target.bracketId] ?? [];
          events.bracket[target.bracketId] = result;
          return result;
        }
        case "likes": {
          const result = events.lfg.likes[target.groupId] ?? [];
          events.lfg.likes[target.groupId] = result;
          return result;
        }
      }
    }
  });
}

const sendEvent = ({ res, data }: { res: Response; data: unknown }) => {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

/** @link https://stackoverflow.com/a/37319954 */
function filterInPlace(
  a: { id: string }[],
  condition: (
    elem: { id: string },
    index: number,
    array: { id: string }[]
  ) => boolean
) {
  let i = 0,
    j = 0;

  while (i < a.length) {
    const val = a[i];
    if (condition(val, i, a)) a[j++] = val;
    i++;
  }

  a.length = j;
  return a;
}
