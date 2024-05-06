import { Effect } from "effect";
import type { CompiledQuery } from "kysely";
import { db } from "~/db/sql";

export const executeTakeMany = <T>(query: CompiledQuery<T>) => {
  return Effect.tryPromise({
    try: () => db.executeQuery(query).then((result) => result.rows),
    // TODO: attach message
    catch: () => new SQLError(),
  });
};

export const executeTakeOne = <T>(query: CompiledQuery<T>) => {
  return Effect.tryPromise({
    try: () =>
      db.executeQuery(query).then((result) => {
        if (result.rows.length === 0) {
          throw new NotFoundError();
        }
        if (result.rows.length > 1) {
          throw new TooManyFoundError();
        }

        return result.rows[0];
      }),
    catch: (error) => {
      if (error instanceof NotFoundError) {
        return new NotFoundError();
      }

      if (error instanceof TooManyFoundError) {
        return new TooManyFoundError();
      }

      // TODO: attach message
      return new SQLError();
    },
  });
};

class SQLError {
  readonly _tag = "SQLError";
}

class NotFoundError {
  readonly _tag = "NotFoundError";
}

class TooManyFoundError {
  readonly _tag = "TooManyFoundError";
}
