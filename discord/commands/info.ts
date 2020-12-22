import getEmbed from "discord/embed";
import { weaponsToEmoji } from "discord/emoji";
import { RespondData } from "discord/utils";
import { getUserByIdentifier } from "prisma/queries/getUserByIdentifier";

const infoCommand = async (
  respond: (result: RespondData) => void,
  discordId: string
) => {
  const user = await getUserByIdentifier(discordId);

  if (!user) {
    respond({
      content: "It seems like that user hasn't logged in on sendou.ink",
    });
    return;
  }

  // const peak = user.player?.switchAccountId
  //   ? await getPlayersPeak(user.player.switchAccountId)
  //   : null;

  const embed = getEmbed({
    title: `${user.username}#${user.discriminator}`,
    url: `https://sendou.ink/u/${user.discordId}`,
    description: user.profile?.bio ?? undefined,
    rightImageSrc: `https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.jpg`,
    fields: [
      {
        name: "Sensitivity",
        value: `${user.profile?.sensStick} Stick ${user.profile?.sensMotion} Motion`,
      },
      {
        name: "Emoji test",
        value: weaponsToEmoji["Luna Blaster"],
      },
    ],
  });

  respond({ embeds: [embed] });
};

export default infoCommand;
