export const stages = [
  "The Reef",
  "Musselforge Fitness",
  "Starfish Mainstage",
  "Humpback Pump Track",
  "Inkblot Art Academy",
  "Sturgeon Shipyard",
  "Moray Towers",
  "Port Mackerel",
  "Manta Maria",
  "Kelp Dome",
  "Snapper Canal",
  "Blackbelly Skatepark",
  "MakoMart",
  "Walleye Warehouse",
  "Shellendorf Institute",
  "Arowana Mall",
  "Goby Arena",
  "Piranha Pit",
  "Camp Triggerfish",
  "Wahoo World",
  "New Albacore Hotel",
  "Ancho-V Games",
  "Skipper Pavilion",
];

export const modesShort = ["TW", "SZ", "TC", "RM", "CB"];

export const navItems = [
  {
    title: "builds",
    items: ["browse", "gear", "analyzer"],
  },
  {
    title: "play",
    items: ["calendar", "battle", "Rankings"],
  },
  {
    title: "tools",
    items: ["planner", "rotations", "top 500"],
  },
  {
    title: "misc",
    items: ["badges", "links"],
  },
];

export const makeTitle = (endOfTitle: string) => `sendou.ink | ${endOfTitle}`;

export type Serialized<T> = {
  [P in keyof T]: T[P] extends Date ? string : Serialized<T[P]>;
};

// TODO:
// export type InferredSerializedAPI<T> = Serialized<Prisma.PromiseReturnType<T>>;
