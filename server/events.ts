import type { Express, Response } from "express";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

export type BracketData = [
  matchNumber: number,
  teamUpper: string,
  teamLower: string,
  scoreUpper: number,
  scoreLower: number
];

export interface EventTargetRecorder {
  bracket: {
    [bracketId: string]: {
      id: string;
      event: (data: BracketData) => void;
    }[];
  };
}

const TargetSchema = z.object({
  type: z.literal("bracket"),
  bracketId: z.string(),
});

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
    if (target.type === "bracket") {
      const sendBracketEvent = (data: BracketData) => sendEvent({ res, data });
      if (!events.bracket[target.bracketId]) {
        events.bracket[target.bracketId] = [{ id, event: sendBracketEvent }];
      } else {
        events.bracket[target.bracketId].push({
          id,
          event: sendBracketEvent,
        });
      }
    }

    res.on("close", () => {
      if (target.type === "bracket") {
        events.bracket[target.bracketId] = events.bracket[
          target.bracketId
        ].filter((event) => event.id !== id);
      }
      res.end();
    });
  });
}

const sendEvent = ({
  res,
  data,
}: {
  res: Response;
  data: Array<string | number>;
}) => {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};
