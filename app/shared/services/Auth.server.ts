import { HttpServer } from "@effect/platform";
import { Schema } from "@effect/schema";
import type { Session as RemixSession } from "@remix-run/node";
import { createCookie, createFileSessionStorage } from "@remix-run/node";
import type { Brand } from "effect";
import {
  Config,
  Context,
  Duration,
  Effect,
  Equal,
  Layer,
  Option,
  String,
} from "effect";
// xxx: needed?
import * as jose from "jose";

class SessionData extends Schema.Class<SessionData>("@schema/SessionData")({
  userId: Schema.String,
}) {}

class TokenData extends Schema.Class<TokenData>("@schema/TokenData")({
  session: Schema.String,
}) {}

type FlashDataKey<Key extends string> = `__flash_${Key}__`;
export type FlashSessionData<Data, FlashData> = Partial<
  Data & {
    [Key in keyof FlashData as FlashDataKey<Key & string>]: FlashData[Key];
  }
>;

export const IsProd = Config.string("node.env").pipe(
  Config.withDefault("production"),
  Config.map(Equal.equals("production")),
);

type BearerToken = Brand.Branded<string, "BearerToken">;
const BearerToken = Schema.transform(
  Schema.TemplateLiteral(Schema.Literal("Token "), Schema.String),
  Schema.String,
  {
    decode: String.replace("Token ", ""),
    encode: (_) => `Token ${_}` as const,
  },
).pipe(Schema.brand("BearerToken"));

const AuthHeader = Schema.Struct({
  authorization: Schema.optional(BearerToken, { exact: true, as: "Option" }),
});

export const make = Effect.gen(function* ($) {
  const secret = yield* $(Config.string("SESSION_SECRET"));
  const cookie = createCookie("__session", {
    secrets: [secret],
    sameSite: true,
  });

  const storage = createFileSessionStorage({
    dir: "app/.sessions",
    cookie,
  });

  const sessionFromSelf = (session: RemixSession<SessionData>) => {
    const sess: Context.Tag.Service<Session> = {
      source: session,
      get: (_) =>
        Effect.sync(() => Option.fromNullable(session.get(_) as never)),
      set: (n, v) => Effect.sync(() => session.set(n, v)),
      unset: (n) => Effect.sync(() => session.unset(n)),
      has: (n) => Effect.sync(() => session.has(n)),
      flash: (n, v) => Effect.sync(() => session.flash(n, v)),
      id: session.id,
      data: session.data as never,
      get logout() {
        return Effect.provideService(destroySession, Session, sess);
      },
      get export() {
        return Effect.provideService(exportSession("7 days"), Session, sess);
      },
    };
    return sess;
  };

  const currentSession = HttpServer.request.schemaHeaders(AuthHeader).pipe(
    Effect.flatMap((_) => _.authorization),
    Effect.map(jose.decodeJwt),
    Effect.flatMap(Schema.decodeUnknown(TokenData)),
    Effect.map((_) => _.session),
    Effect.andThen(storage.getSession),
    Effect.catchAll((_) => Effect.promise(() => storage.getSession())),
    Effect.map(sessionFromSelf),
    Effect.orDie, // Sessions always exist (?)
    Effect.withSpan("Auth.currentSession"),
  );

  const exportSession = (maxAge?: Duration.DurationInput) =>
    Session.pipe(
      Effect.andThen((_) =>
        storage.commitSession(_.source, {
          maxAge: maxAge ? Duration.toSeconds(maxAge) : undefined,
        }),
      ),
      Effect.andThen((_) =>
        new jose.UnsecuredJWT({ session: _ })
          .setIssuedAt()
          .setIssuer("urn:example:issuer")
          .setAudience("urn:example:audience")
          .setExpirationTime("2h")
          .encode(),
      ),
      Effect.orDie,
      Effect.withSpan("Auth.exportSession"),
    );

  const destroySession = Session.pipe(
    Effect.andThen((_) => storage.destroySession(_.source)),
    Effect.orDie,
    Effect.withSpan("Auth.destroySessionCookie"),
  );

  return {
    currentSession,
    exportSession,
    destroySession,
  };
});

export class Auth extends Effect.Tag("@services/Auth")<
  Auth,
  Effect.Effect.Success<typeof make>
>() {
  static live = Layer.effect(this, make);
  static layer = this.live;
}

export class Session extends Context.Tag("@services/Session")<
  Session,
  {
    source: RemixSession<SessionData>;
    get: <Key extends keyof SessionData>(
      name: Key,
    ) => Effect.Effect<Option.Option<SessionData[Key]>>;
    set: <Key extends keyof SessionData>(
      name: Key,
      value: Schema.Struct.Encoded<(typeof SessionData)["fields"]>[Key],
    ) => Effect.Effect<void>;
    unset: <Key extends keyof SessionData>(name: Key) => Effect.Effect<void>;
    has: <Key extends keyof SessionData>(name: Key) => Effect.Effect<boolean>;
    flash: <Key extends keyof SessionData>(
      name: Key,
      value: Schema.Struct.Encoded<(typeof SessionData)["fields"]>[Key],
    ) => Effect.Effect<void>;
    id: string;
    data: FlashSessionData<SessionData, SessionData>;
    logout: Effect.Effect<string>;
    export: Effect.Effect<string>;
  }
>() {
  static live = Layer.effect(this, Auth.currentSession);
  static layer = Layer.provide(this.live, Auth.layer);
}
