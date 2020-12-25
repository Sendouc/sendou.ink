import { Prisma } from "@prisma/client";

const getUsers = (): Prisma.UserCreateArgs["data"][] => {
  const result = [
    {
      username: "N-ZAP",
      discriminator: "6227",
      discordId: "455039198672453645",
      discordAvatar: "f809176af93132c3db5f0a5019e96339",
      profile: {
        create: {
          bio: "My cool bio! Supports markdown too: **bolded**",
          country: "US",
          customUrlPath: "tester",
          sensMotion: 4.5,
          sensStick: -2.0,
          weaponPool: [
            "Tenta Brella",
            "Range Blaster",
            "Luna Blaster",
            "N-ZAP '89",
          ],
          twitterName: "nintendovs",
          twitchName: "nintendo",
          youtubeId: "UCAtobAxsQcACwDZCSH9uJfA",
        },
      },
    },
  ];

  return result;
};

export default getUsers;
