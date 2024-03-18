export const tags = {
  BADGE: {
    color: "#000",
  },
  SPECIAL: {
    color: "#CE93D8",
  },
  ART: {
    color: "#C158F6",
  },
  MONEY: {
    color: "#96F29D",
  },
  REGION: {
    color: "#FF8C8C",
  },
  LOW: {
    color: "#BBDEFB",
  },
  COUNT: {
    color: "#62E8F5",
  },
  LAN: {
    color: "#FFF",
  },
  QUALIFIER: {
    color: "#FFC0CB",
  },
  SZ: {
    color: "#F44336",
  },
  TW: {
    color: "#D50000",
  },
  S1: {
    color: "#E5E4E2",
  },
  S2: {
    color: "#388E3C",
  },
  SR: {
    color: "#FBCEB1",
  },
  CARDS: {
    color: "#E4D00A",
  },
  FULL_TOURNAMENT: {
    color: "#FFC0CB",
  },
};

export const REG_CLOSES_AT_OPTIONS = [
  "0",
  "30min",
  "1h",
  "2h",
  "3h",
  "6h",
  "12h",
  "24h",
  "48h",
  "72h",
] as const;

export type RegClosesAtOption = (typeof REG_CLOSES_AT_OPTIONS)[number];
