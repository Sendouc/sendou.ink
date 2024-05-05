import { Schema } from "@effect/schema";
import { useActionData, useLoaderData } from "@remix-run/react";
import { useMemo } from "react";

export const useSchemaLoaderData = <schema extends Schema.Schema.AnyNoContext>(
  schema: schema,
) => {
  const data = useLoaderData();

  return useMemo(() => Schema.decodeUnknownSync(schema)(data), [data, schema]);
};

export const useSchemaActionData = <schema extends Schema.Schema.AnyNoContext>(
  schema: schema,
) => {
  const data = useActionData();

  return useMemo(() => Schema.decodeUnknownSync(schema)(data), [data, schema]);
};
