import { suite } from "uvu";
import * as assert from "uvu/assert";
import * as Test from "~/utils/Test";
import { action, type adminActionSchema } from "./admin";

const AdminRoute = suite("/admin");

const adminAction = Test.wrappedAction<typeof adminActionSchema>({ action });

AdminRoute("test", async () => {
  const result = await adminAction({ _action: "REFRESH" }, { user: "admin" });

  assert.equal(result.status, 401);
});

AdminRoute.run();
