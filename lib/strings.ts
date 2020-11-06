export const getLocalizedMonthYearString = (
  month: number,
  year: number,
  locale: string
) => {
  const dateForLocalization = new Date();
  dateForLocalization.setDate(1);
  dateForLocalization.setMonth(month - 1);
  dateForLocalization.setFullYear(year);
  return dateForLocalization.toLocaleString(locale, {
    month: "long",
    year: "numeric",
  });
};

export const getRankingString = (ranking: number) => {
  switch (ranking) {
    case 1:
      return "🥇";
    case 2:
      return "🥈";
    case 3:
      return "🥉";

    default:
      return `${ranking}`;
  }
};

// User attributes - should be virtuals in future if support gets added to Prisma

export const getFullUsername = ({
  username,
  discriminator,
}: {
  username: string;
  discriminator: string;
}) => `${username}#${discriminator}`;

export const getDiscordAvatarUrl = ({
  discordId,
  discordAvatar,
}: {
  discordId: string;
  discordAvatar: string | null;
}) => `https://cdn.discordapp.com/avatars/${discordId}/${discordAvatar}.jpg`;

export const getProfilePath = ({
  discordId,
  customUrlPath,
}: {
  discordId: string;
  customUrlPath: string | null | undefined;
}) => (customUrlPath ? `/u/${customUrlPath}` : `/u/${discordId}`);
