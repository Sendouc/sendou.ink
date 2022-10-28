export const modes = [
  { short: "TW" },
  { short: "SZ" },
  { short: "TC" },
  { short: "RM" },
  { short: "CB" },
] as const;

export const modesShort = modes.map((mode) => mode.short);
