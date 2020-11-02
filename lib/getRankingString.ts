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
