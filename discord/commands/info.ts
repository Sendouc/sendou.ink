import { countries, getEmojiFlag } from "countries-list";
import getEmbed, { EmbedArgs } from "discord/embed";
import { weaponsToEmoji } from "discord/emoji";
import { RespondFuction } from "discord/utils";
import { getPlayersPeak } from "prisma/queries/getPlayersPeak";
import { getUserByIdentifier } from "prisma/queries/getUserByIdentifier";

const infoCommand = async (respond: RespondFuction, discordId: string) => {
  const user = await getUserByIdentifier(discordId);

  if (!user) {
    respond({
      content: "It seems like that user hasn't logged in on sendou.ink",
    });
    return;
  }

  const peak = user.player?.switchAccountId
    ? await getPlayersPeak(user.player.switchAccountId)
    : null;

  const embed = getEmbed({
    title: `${user.username}#${user.discriminator}`,
    url: `https://sendou.ink/u/${user.discordId}`,
    description: user.profile?.bio ?? undefined,
    rightImageSrc: `https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.jpg`,
    fields: getFields(),
  });

  function getFields() {
    if (!user) return [];
    const result: EmbedArgs["fields"] = [];

    if (user.profile?.country) {
      const countryCode = user.profile.country as keyof typeof countries;
      result.push({
        name: "Country",
        value: `${getEmojiFlag(countryCode)} ${countries[countryCode].name}`,
      });
    }

    if (user.profile?.weaponPool.length) {
      result.push({
        name: "Weapons",
        value: user.profile.weaponPool
          // @ts-ignore
          .map((weapon) => weaponsToEmoji[weapon])
          .join(" "),
      });
    }

    let stickString = "";
    if (typeof user.profile?.sensStick === "number") {
      const sens = user.profile.sensStick;
      stickString = `${sens > 0 ? "+" : ""}${sens} Stick `;
    }

    let motionString = "";
    if (typeof user.profile?.sensMotion === "number") {
      const sens = user.profile.sensMotion;
      motionString = `${sens > 0 ? "+" : ""}${sens} Motion`;
    }

    if (stickString || motionString) {
      result.push({
        name: "Sensitivity",
        value: stickString + motionString,
      });
    }

    return result;
  }

  respond({ embeds: [embed] });
};

export default infoCommand;
