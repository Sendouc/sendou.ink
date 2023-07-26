export const TIERS = [
  {
    name: "LEVIATHAN",
    percentile: 5,
  },
  {
    name: "DIAMOND",
    percentile: 15, // 10
  },
  {
    name: "PLATINUM",
    percentile: 30, // 15
  },
  {
    name: "GOLD",
    percentile: 47.5, // 17.5
  },
  {
    name: "SILVER",
    percentile: 67.5, // 20
  },
  {
    name: "BRONZE",
    percentile: 85, // 17.5
  },
  {
    name: "IRON",
    percentile: 100, // 15
  },
] as const;

export type TierName = (typeof TIERS)[number]["name"];
