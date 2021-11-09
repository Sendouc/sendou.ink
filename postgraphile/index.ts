import { config } from "dotenv";
config();

import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import cors from "fastify-cors";
import {
  postgraphile,
  PostGraphileResponseFastify3,
  PostGraphileResponse,
  PostGraphileOptions,
} from "postgraphile";

const PORT = 4000;

function NonNullRelationsPlugin(builder) {
  builder.hook("GraphQLObjectType:fields:field", (field, build, context) => {
    if (!context.scope.isPgForwardRelationField) {
      return field;
    }
    return {
      ...field,
      type: new build.graphql.GraphQLNonNull(field.type),
    };
  });
}

// PostGraphile options; see https://www.graphile.org/postgraphile/usage-library/#api-postgraphilepgconfig-schemaname-options
const options: PostGraphileOptions = {
  // pluginHook,
  appendPlugins: [NonNullRelationsPlugin],
  // pgSettings(req) {
  //   // Adding this to ensure that all servers pass through the request in a
  //   // good enough way that we can extract headers.
  //   // CREATE FUNCTION current_user_id() RETURNS text AS $$ SELECT current_setting('graphile.test.x-user-id', TRUE); $$ LANGUAGE sql STABLE;
  //   return {
  //     'graphile.test.x-user-id':
  //       req.headers['x-user-id'] ||
  //       // `normalizedConnectionParams` comes from websocket connections, where
  //       // the headers often cannot be customized by the client.
  //       (req as any).normalizedConnectionParams?.['x-user-id'],
  //   };
  // },
  watchPg: true,
  graphiql: true,
  enhanceGraphiql: true,
  subscriptions: true,
  dynamicJson: true,
  setofFunctionsContainNulls: false,
  ignoreRBAC: false,
  showErrorStack: "json",
  extendedErrors: ["hint", "detail", "errcode"],
  allowExplain: true,
  legacyRelations: "omit",
  // exportGqlSchemaPath: `${__dirname}/schema.graphql`,
  sortExport: true,
};

const middleware = postgraphile(process.env.DATABASE_URL, "sendou_ink", {
  ...options,
  // pgSettings(req) {
  //   // Adding this to ensure that all servers pass through the request in a
  //   // good enough way that we can extract headers.
  //   // CREATE FUNCTION current_user_id() RETURNS text AS $$ SELECT current_setting('graphile.test.x-user-id', TRUE); $$ LANGUAGE sql STABLE;
  //   return {
  //     'graphile.test.x-user-id':
  //       // In GraphiQL, open console and enter `document.cookie = "userId=3"` to become user 3.
  //       (req._fastifyRequest as FastifyRequest)?.cookies.userId ||
  //       // `normalizedConnectionParams` comes from websocket connections, where
  //       // the headers often cannot be customized by the client.
  //       (req as any).normalizedConnectionParams?.['x-user-id'],
  //   };
  // },
});

/******************************************************************************/
// These middlewares aren't needed; we just add them to make sure that
// PostGraphile still works correctly with them in place.

// import fastifyCompression from 'fastify-compress';
// fastify.register(fastifyCompression, { threshold: 0, inflateIfDeflated: false });

// import fastifyCookie from 'fastify-cookie';
// fastify.register(fastifyCookie, { secret: 'USE_A_SECURE_SECRET!' });

/******************************************************************************/

const fastify = Fastify({ logger: true });

fastify.register(cors);

/**
 * Converts a PostGraphile route handler into a Fastify request handler.
 */
const convertHandler =
  (handler: (res: PostGraphileResponse) => Promise<void>) =>
  (request: FastifyRequest, reply: FastifyReply) =>
    handler(new PostGraphileResponseFastify3(request, reply));

// IMPORTANT: do **NOT** change these routes here; if you want to change the
// routes, do so in PostGraphile options. If you change the routes here only
// then GraphiQL won't know where to find the GraphQL endpoint and the GraphQL
// endpoint won't know where to indicate the EventStream for watch mode is.
// (There may be other problems too.)

// OPTIONS requests, for CORS/etc
fastify.options(
  middleware.graphqlRoute,
  convertHandler(middleware.graphqlRouteHandler)
);

// This is the main middleware
fastify.post(
  middleware.graphqlRoute,
  convertHandler(middleware.graphqlRouteHandler)
);

// GraphiQL, if you need it
if (middleware.options.graphiql) {
  if (middleware.graphiqlRouteHandler) {
    fastify.head(
      middleware.graphiqlRoute,
      convertHandler(middleware.graphiqlRouteHandler)
    );
    fastify.get(
      middleware.graphiqlRoute,
      convertHandler(middleware.graphiqlRouteHandler)
    );
  }
  // Remove this if you don't want the PostGraphile logo as your favicon!
  if (middleware.faviconRouteHandler) {
    fastify.get("/favicon.ico", convertHandler(middleware.faviconRouteHandler));
  }
}

// If you need watch mode, this is the route served by the
// X-GraphQL-Event-Stream header; see:
// https://github.com/graphql/graphql-over-http/issues/48
if (middleware.options.watchPg) {
  if (middleware.eventStreamRouteHandler) {
    fastify.options(
      middleware.eventStreamRoute,
      convertHandler(middleware.eventStreamRouteHandler)
    );
    fastify.get(
      middleware.eventStreamRoute,
      convertHandler(middleware.eventStreamRouteHandler)
    );
  }
}

fastify.listen(PORT, (err, address) => {
  if (err) {
    fastify.log.error(String(err));
    process.exit(1);
  }
  fastify.log.info(
    `PostGraphiQL available at ${address}${middleware.graphiqlRoute} 🚀`
  );
});
