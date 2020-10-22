import {
  arg,
  inputObjectType,
  mutationType,
  objectType,
  queryType,
  stringArg,
} from "@nexus/schema";
import { getMySession } from "lib/getMySession";
import { profileSchema } from "validators/profile";

export const User = objectType({
  name: "User",
  definition(t) {
    t.model.id();
    t.model.discordId();
    t.string("fullUsername", {
      resolve: (root) => `${root.username}#${root.discriminator}`,
      nullable: false,
    });
    t.string("avatarUrl", {
      resolve: (root) =>
        `https://cdn.discordapp.com/avatars/${root.discordId}/${root.discordAvatar}.jpg`,
    });
    t.string("profilePath", {
      resolve: (root) => `/u/${root.discordId}`,
      nullable: false,
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
      resolve: (root) =>
        root.sensStick ? root.sensStick / 10 : root.sensStick,
    });
    t.float("sensMotion", {
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
      type: "Boolean",
      nullable: false,
      args: {
        profile: arg({ type: UpdateUserProfileInput, required: true }),
      },
      authorize: async (_root, _args, ctx) => {
        return true;
      },
      resolve: async (_root, args, ctx) => {
        const user = await getMySession(ctx.req);
        if (!user) throw Error("Not logged in");

        profileSchema.parse(args.profile);

        if (args.profile.customUrlPath) {
          const profileWithSameCustomUrl = await ctx.prisma.profile.findOne({
            where: {
              customUrlPath: args.profile.customUrlPath,
            },
          });

          if (profileWithSameCustomUrl) throw Error("Custom URL already taken");
        }

        const argsForDb = {
          // can't set array as undefined or null -> need to use [] instead due to how prisma does things
          weaponPool: args.profile?.weaponPool ? args.profile.weaponPool : [],
          customUrlPath: args.profile?.customUrlPath
            ? args.profile.customUrlPath.toLowerCase()
            : null,
          twitterName: args.profile?.twitterName
            ? args.profile.twitterName.toLowerCase()
            : null,
          twitchName: args.profile?.twitchName
            ? args.profile.twitchName.toLowerCase()
            : null,
          ...args.profile?.weaponPool,
        };

        // FIXME: set custom url to lowerCase
        await ctx.prisma.profile.upsert({
          create: {
            user: { connect: { id: user.id } },
            ...argsForDb,
          },
          update: {
            ...args.profile,
            weaponPool: args.profile?.weaponPool ? args.profile.weaponPool : [],
          },
          where: { userId: user.id },
        });

        return true;
      },
    });
  },
});
