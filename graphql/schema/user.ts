import {
  inputObjectType,
  mutationType,
  objectType,
  queryType,
  stringArg,
} from "@nexus/schema";
import { getSession } from "next-auth/client";

export const User = objectType({
  name: "User",
  definition(t) {
    t.model.discordId();
    t.string("fullUsername", {
      resolve: (root) => `${root.username}#${root.discriminator}`,
    });
    t.string("avatarUrl", {
      resolve: (root) =>
        `https://cdn.discordapp.com/avatars/${root.discordId}/${root.discordAvatar}.jpg`,
      nullable: true,
    });
    t.string("profilePath", {
      resolve: (root) => `/u/${root.discordId}`,
    });
    // FIXME: this seems to generate extra query (on top of the one it's expected to generate)
    t.model.profile();
  },
});

export const Profile = objectType({
  name: "Profile",
  definition(t) {
    t.model.twitterName();
    t.model.customUrlPath();
    t.model.twitchName();
    t.model.youtubeId();
    t.model.country();
    t.model.bio();
    t.float("sensStick", {
      nullable: true,
      resolve: (root) =>
        root.sensStick ? root.sensStick / 10 : root.sensStick,
    });
    t.float("sensMotion", {
      nullable: true,
      resolve: (root) =>
        root.sensMotion ? root.sensMotion / 10 : root.sensMotion,
    });
    t.model.weaponPool();
  },
});

export const Query = queryType({
  definition(t) {
    t.field("getUserByIdentifier", {
      type: User,
      nullable: true,
      args: {
        identifier: stringArg({ required: true }),
      },
      resolve: (_root, { identifier }, ctx) => {
        return ctx.prisma.user.findFirst({
          where: {
            // this is ok because the values are mutually exclusive: customUrlPath can't contain only numbers etc.
            OR: [
              {
                discordId: identifier,
              },
              {
                profile: {
                  customUrlPath: identifier.toLowerCase(),
                },
              },
            ],
          },
        });
      },
    });
  },
});

export const UpdateUserProfileInput = inputObjectType({
  name: "UpdateUserProfileInput",
  definition(t) {
    t.string("twitterName");
    t.string("customUrlPath");
    t.string("twitchName");
    t.string("youtubeId");
    t.string("country");
    t.string("bio");
    t.float("sensStick");
    t.float("sensMotion");
    t.field("weaponPool", {
      type: "String",
      list: [true],
    });
  },
});

export const Mutation = mutationType({
  definition(t) {
    t.field("updateUserProfile", {
      type: Profile,
      nullable: false,
      args: {
        profile: UpdateUserProfileInput,
      },
      authorize: async (_root, _args, ctx) => {
        return true;
      },
      resolve: async (_root, args, ctx) => {
        const session = await getSession({ req: ctx.req });
        console.log({ session });

        // FIXME: set custom url to lowerCase
        return await ctx.prisma.profile.upsert({
          create: { user: { connect: { id: 4 } }, ...args.profile },
          // FIXME: doing it like this makes removing values impossible?
          update: args.profile,
          where: { userId: 4 },
        });
      },
    });
  },
});
