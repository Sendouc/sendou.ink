import * as Schema from "@effect/schema/Schema";
import { Effect, Layer } from "effect";
import { db } from "~/db/sql";
import { COMMON_USER_FIELDS } from "~/utils/kysely.server";
import type { User } from "../user-page-models";
import { AuthUser } from "../user-page-models";

const service = {
  authUserById: (id: User["id"]) =>
    Effect.gen(function* () {
      const row = yield* Effect.promise(() =>
        db
          .selectFrom("User")
          .select([...COMMON_USER_FIELDS, "User.banned"])
          .where("User.id", "=", id)
          .executeTakeFirstOrThrow(),
      );

      // xxx: perms
      return Schema.decodeSync(AuthUser)({
        ...row,
        perms: [],
      });
    }),
};

export class Users extends Effect.Tag("@services/Users")<
  Users,
  typeof service
>() {
  static live = Layer.succeed(this, service);
  static layer = this.live;
}
