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

/**
 * Return medal emoji for top 3, otherwise returns the number as string.
 */
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

export function makeNameUrlFriendly(name: string) {
  return name.trim().replace(/\s\s+/g, " ").toLowerCase().replace(/ /g, "-");
}

// User attributes - should be virtuals in future if support gets added to Prisma

/**
 * Takes user object and returns the formatted username morphing it with the Discord discriminator.
 * @example
 * // returns "Sendou#0043"
 * getFullUsername({username: "Sendou", discriminator: "0043"})
 */
export const getFullUsername = ({
  username,
  discriminator,
}: {
  username: string;
  discriminator: string;
}) => `${username}#${discriminator}`;

export const getProfilePath = ({
  discordId,
  customUrlPath,
}: {
  discordId: string;
  customUrlPath: string | null | undefined;
}) => (customUrlPath ? `/u/${customUrlPath}` : `/u/${discordId}`);
