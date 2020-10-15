import { objectType, queryType, stringArg } from "@nexus/schema";

export const User = objectType({
  name: "User",
  // FIXME: Remove properties that don't need to be exposed: username, avatar & discriminator
  definition(t) {
    t.model.discordId();
    t.model.username();
    t.model.discriminator();
    t.model.discordAvatar();
    // FIXME: this seems to generate extra query (on top of the one it's expected to generatei thi)
    t.model.profile();
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
  },
});

export const Profile = objectType({
  name: "Profile",
  definition(t) {
    // FIXME: Add Twitter
    t.model.customUrlPath();
    t.model.twitchName();
    t.model.youtubeId();
    t.model.country();
    t.model.bio();
    // FIXME: Sens as float
    t.model.sensMotion();
    t.model.sensStick();
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
