import { Prisma } from "@prisma/client";

const getUsers = (): Prisma.UserCreateArgs["data"][] => {
  const result = [
    {
      username: "Sendou",
      discriminator: "4059",
      discordId: "79237403620945920",
      discordAvatar: "59c321a21f73c18eda69359ccabdc38e",
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
