import {
  arg,
  inputObjectType,
  mutationType,
  objectType,
  queryType,
  stringArg,
} from "@nexus/schema";
import { getMySession } from "lib/getMySession";
import { profileSchemaBackend } from "validators/profile";

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
      resolve: async (_root, args, ctx) => {
        const user = await getMySession(ctx.req);
        if (!user) throw Error("Not logged in");

        const argsForDb = {
          ...args.profile,
          // can't set array as undefined or null -> need to use [] instead due to how prisma does things
          weaponPool: args.profile.weaponPool ? args.profile.weaponPool : [],
          customUrlPath:
            typeof args.profile.customUrlPath === "string"
              ? args.profile.customUrlPath.toLowerCase()
              : args.profile.customUrlPath,
          twitterName:
            typeof args.profile.twitterName === "string"
              ? args.profile.twitterName.toLowerCase()
              : args.profile.twitterName,
          twitchName:
            typeof args.profile.twitchName === "string"
              ? args.profile.twitchName.toLowerCase()
              : args.profile.twitchName,
          // sens is saved as integers in the database
          sensStick:
            typeof args.profile.sensStick === "number"
              ? args.profile.sensStick * 10
              : args.profile.sensStick,
          sensMotion:
            typeof args.profile.sensMotion === "number"
              ? args.profile.sensMotion * 10
              : args.profile.sensMotion,
        };

        profileSchemaBackend.parse(argsForDb);

        if (argsForDb.customUrlPath) {
          const profileWithSameCustomUrl = await ctx.prisma.profile.findOne({
            where: {
              customUrlPath: argsForDb.customUrlPath,
            },
          });

          if (
            profileWithSameCustomUrl &&
            profileWithSameCustomUrl.userId !== user.id
          )
            throw Error("Custom URL already taken");
        }

        await ctx.prisma.profile.upsert({
          create: {
            user: { connect: { id: user.id } },
            ...argsForDb,
          },
          update: {
            ...argsForDb,
          },
          where: { userId: user.id },
        });

        return true;
      },
    });
  },
});
