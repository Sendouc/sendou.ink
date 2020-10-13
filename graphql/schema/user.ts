import { objectType, queryType, stringArg } from "@nexus/schema";

export const User = objectType({
  name: "User",
  definition(t) {
    t.model.id();
    t.model.username();
    t.model.discriminator();
    t.string("fullUserName", {resolve: (root, asd) => `${root.username}`})
  },
});

export const Query = queryType({
  definition(t) {
    t.field("getUserByIdentifier", {
      type: User,
      nullable: true,
      args: {
        identifier: stringArg({required: true})
      },
      resolve: (_root, {identifier}, ctx) => ctx.prisma.user.findOne({
        where: {
          discordId: identifier
        }
      })
    })
  }
})