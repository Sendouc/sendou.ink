import type { DetailedTeam } from "../team-types";

export function findByIdentifier(/*customUrl: string*/): DetailedTeam | null {
  return {
    countries: ["FR"],
    name: "Alliance Rogue",
    lutiDiv: "X",
    teamXp: "2981.2",
    twitter: "AllianceRogueFR",
    avatarSrc:
      "https://pbs.twimg.com/profile_images/1567529215523786754/RYRI0cNc_400x400.jpg",
    bannerSrc: "https://abload.de/img/fjkfa-uxkamgdbxr3iqn.jpeg",
    members: [
      {
        discordName: "Kiver",
        discordAvatar: "2ce2f7e4fe6cd2aeceec940ecebcb22c",
        discordId: "92909500100513792",
        role: "FRONTLINE",
        weapons: [40, 20, 210, 1000],
      },
      {
        discordName: "Scar",
        discordAvatar: "fcf2508d5bc21046108a19d26cafce31",
        discordId: "129931199383601153",
        role: "FRONTLINE",
        weapons: [20, 3020],
      },
      {
        discordName: "Grey",
        discordAvatar: "a_ce66d041d5bde589099ebc68ecf74da0",
        discordId: "99931397451419648",
        role: "SUPPORT",
        weapons: [20, 10, 1030],
      },
      {
        discordName: "Jay",
        discordAvatar: "fbafa57c8b571378806c743dcad6a067",
        discordId: "273503438124613632",
        role: "BACKLINE",
        weapons: [2040],
      },
    ],
    results: {
      count: 23,
      placements: [
        {
          count: 10,
          placement: 1,
        },
        {
          count: 5,
          placement: 2,
        },
      ],
    },
  };
}
