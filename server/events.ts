import type { Express } from "express";

export function setUpEvents(app: Express): void {
  // https://stackoverflow.com/a/59041709
  app.get("/events", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Connection", "keep-alive");

    // https://stackoverflow.com/a/69938612
    // Without this Express compression prevents any messages from being
    // sent until `res.end()` is called
    res.setHeader("Cache-Control", "no-cache, no-transform");

    res.flushHeaders();

    let counter = 0;
    const interValID = setInterval(() => {
      counter++;
      console.log("write", counter);
      res.write(`data: ${JSON.stringify({ num: counter })}\n\n`); // res.write() instead of res.send()
    }, 1000);

    // If client closes connection, stop sending events
    res.on("close", () => {
      console.log("client dropped me");
      clearInterval(interValID);
      res.end();
    });
  });
}
