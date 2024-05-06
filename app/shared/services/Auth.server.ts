import { HttpServer } from "@effect/platform";
import { Schema } from "@effect/schema";
import { createCookieSessionStorage } from "@remix-run/node";
import { Config, Effect, Equal, Layer, Secret, Option } from "effect";
import { Users } from "~/features/user-page/services/Users.server";
import type { AuthUser } from "~/features/user-page/user-page-models";
import { User } from "~/features/user-page/user-page-models";

// xxx: some other place
export const IsProd = Config.string("node.env").pipe(
  Config.withDefault("production"),
  Config.map(Equal.equals("production")),
);

export const make = Effect.gen(function* ($) {
  const secret = yield* $(Config.secret("SESSION_SECRET"));
  const isProd = yield* IsProd;

  const ONE_YEAR_IN_SECONDS = 31_536_000;
  const sessionStorage = createCookieSessionStorage({
    cookie: {
      name: "__session",
      sameSite: "lax",
      // need to specify domain so that sub-domains can access it
      domain: isProd ? "sendou.ink" : undefined,
      path: "/",
      httpOnly: true,
      secrets: [Secret.value(secret)],
      secure: isProd,
      maxAge: ONE_YEAR_IN_SECONDS,
    },
  });

  const userIdFromSession = HttpServer.request.schemaHeaders(Schema.Any).pipe(
    Effect.flatMap(({ cookie }) =>
      Effect.promise(() => sessionStorage.getSession(cookie)),
    ),
    Effect.map(
      (session) =>
        session.get(IMPERSONATED_SESSION_KEY) ?? session.get(SESSION_KEY),
    ),
    Effect.flatMap(
      Schema.decodeUnknown(Schema.OptionFromUndefinedOr(User.fields.id)),
    ),
    Effect.catchAll(() => Effect.succeed(Option.none<User["id"]>())),
  );

  const loggedInUser = Effect.gen(function* () {
    const users = yield* Users;

    const userId = yield* userIdFromSession.pipe(
      Effect.flatten,
      Effect.mapError(() => new NotLoggedInError()),
    );
    const user = yield* users.authUserById(userId);

    // xxx: BanService check here and maybe throw BannedError

    return user;
  });

  const loggedInUserOption = loggedInUser.pipe(
    Effect.map(Option.some),
    Effect.catchTag("NotLoggedInError", () =>
      Effect.succeed(Option.none<AuthUser>()),
    ),
  );

  return {
    loggedInUser,
    loggedInUserOption,
  };
});

const SESSION_KEY = "user";
const IMPERSONATED_SESSION_KEY = "impersonated_user";

// class BannedError {
//   readonly _tag = "BannedError";
// }

class NotLoggedInError {
  readonly _tag = "NotLoggedInError";
}

export class Auth extends Effect.Tag("@services/Auth")<
  Auth,
  Effect.Effect.Success<typeof make>
>() {
  static live = Layer.effect(this, make);
  static layer = this.live;
}
