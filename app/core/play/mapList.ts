import { Mode } from "@prisma/client";
import clone from "just-clone";
import shuffle from "just-shuffle";
import invariant from "tiny-invariant";
import { StageName, stageToId } from "../stages/stages";

const AMOUNT_OF_STAGES_TO_GENERATE = 9;
const LEGAL_MODES: Mode[] = ["TC", "RM", "CB"];

// ⚠️ Every used mode needs to have at least AMOUNT_OF_STAGES_TO_GENERATE maps
const LEGAL_STAGES: Record<Mode, StageName[]> = {
  TW: [],
  SZ: [
    "Ancho-V Games",
    "Blackbelly Skatepark",
    "Camp Triggerfish",
    "Goby Arena",
    "Humpback Pump Track",
    "Inkblot Art Academy",
    "MakoMart",
    "Manta Maria",
    "Musselforge Fitness",
    "New Albacore Hotel",
    "Piranha Pit",
    "Shellendorf Institute",
    "Skipper Pavilion",
    "Snapper Canal",
    "Starfish Mainstage",
    "Sturgeon Shipyard",
    "The Reef",
    "Wahoo World",
  ],
  TC: [
    "Ancho-V Games",
    "Humpback Pump Track",
    "Inkblot Art Academy",
    "MakoMart",
    "Manta Maria",
    "Musselforge Fitness",
    "Piranha Pit",
    "Shellendorf Institute",
    "Starfish Mainstage",
    "Sturgeon Shipyard",
    "The Reef",
  ],
  RM: [
    "Ancho-V Games",
    "Blackbelly Skatepark",
    "Humpback Pump Track",
    "MakoMart",
    "Manta Maria",
    "Musselforge Fitness",
    "Snapper Canal",
    "Starfish Mainstage",
    "Sturgeon Shipyard",
    "The Reef",
  ],
  CB: [
    "Ancho-V Games",
    "Humpback Pump Track",
    "Inkblot Art Academy",
    "MakoMart",
    "Manta Maria",
    "Musselforge Fitness",
    "New Albacore Hotel",
    "Piranha Pit",
    "Snapper Canal",
    "Starfish Mainstage",
    "Sturgeon Shipyard",
    "The Reef",
    "Wahoo World",
  ],
};

export function generateMapListForLfgMatch(): {
  order: number;
  stageId: number;
}[] {
  const modesShuffled = shuffle(LEGAL_MODES);
  const stagesShuffled = Object.fromEntries(
    Object.entries(clone(LEGAL_STAGES)).map(([key, stages]) => [
      key,
      shuffle(stages),
    ])
  ) as Record<Mode, StageName[]>;
  const usedMaps = new Set<StageName>();

  const stageList: { name: string; mode: Mode }[] = [];
  for (let i = 0; i < AMOUNT_OF_STAGES_TO_GENERATE; i++) {
    const mode = (() => {
      if (i !== 0 && i % 2 !== 0) {
        return "SZ";
      }

      const result = modesShuffled.shift();
      invariant(result);
      modesShuffled.push(result);

      return result;
    })();

    const name = (() => {
      const stages = stagesShuffled[mode];
      // guaranteed to never run out of unused maps since every mode has at least AMOUNT_OF_STAGES_TO_GENERATE maps
      while (usedMaps.has(stages[0])) {
        stages.shift();
      }

      usedMaps.add(stages[0]);
      return stages[0];
    })();

    stageList.push({ name, mode });
  }

  return stageList.map((stage, i) => ({
    order: i + 1,
    stageId: stageToId(stage),
  }));
}
