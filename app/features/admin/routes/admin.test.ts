import { suite } from "uvu";
import * as assert from "uvu/assert";
import * as Test from "~/utils/Test";
import { action, type adminActionSchema } from "./admin";

const AdminRoute = suite("/admin");

const wAction = Test.wrappedAction<typeof adminActionSchema>({ action });

AdminRoute("test", async () => {
  // const result = (await loader({
  //   request: new Request("http://app.com/path"),
  //   params: {},
  //   context: {},
  // })) as Response;

  // console.log(await result.json());
  // console.log(await db.selectFrom("User").selectAll().limit(1).execute());

  // assert.equal(result.status, 401);

  const result = await wAction({ _action: "REFRESH" });

  assert.equal(result.status, 401);
});

AdminRoute.run();
