import { HttpServer } from "@effect/platform";
import { Console, Effect } from "effect";
import { Remix } from "~/shared/prelude.server";

const barJob = Effect.gen(function* () {
  yield* Effect.sleep(5000);

  yield* Console.log("did the thing : )");
});

export const loader = Remix.loaderGen(function* () {
  yield* Effect.forkDaemon(barJob);

  return yield* HttpServer.response.json({ hello: "world" });
});
