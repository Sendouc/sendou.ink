import { Mode } from "@prisma/client";
import invariant from "tiny-invariant";
import { ArrayElement } from "~/utils";

export type StageName = ArrayElement<typeof stages>;
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
] as const;

export const modesShort: Mode[] = ["TW", "SZ", "TC", "RM", "CB"];
export const modesShortToLong: Record<Mode, string> = {
  TW: "Turf War",
  SZ: "Splat Zones",
  TC: "Tower Control",
  RM: "Rainmaker",
  CB: "Clam Blitz",
} as const;

export function stagesWithIds() {
  const result: { name: string; mode: Mode; id: number }[] = [];
  let id = 1;

  for (const mode of modesShort) {
    for (const name of stages) {
      result.push({ mode, name, id: id++ });
    }
  }

  return result;
}

export function stageToId({
  mode,
  name,
}: {
  mode: Mode;
  name: string;
}): number {
  const stageObj = stagesWithIds().find(
    (stage) => stage.name === name && stage.mode === mode
  );
  invariant(stageObj, `Unknown stage: ${mode} ${name}`);
  return stageObj.id;
}

export function idToStage(id: number) {
  const stageObj = stagesWithIds().find((stage) => stage.id === id);
  invariant(stageObj, `Unknown stage id: ${id}`);
  return stageObj;
}
