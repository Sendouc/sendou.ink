import { Playstyle } from ".prisma/client";
import { FreeAgentRegion } from "app/freeagents/hooks";

export function isFreeAgentPlaystyle(value: unknown): value is Playstyle {
  return (
    typeof value === "string" &&
    ["FRONTLINE", "MIDLINE", "BACKLINE"].includes(value)
  );
}

export function isFreeAgentRegion(value: unknown): value is FreeAgentRegion {
  return (
    typeof value === "string" && ["EUROPE", "AMERICAS", "ASIA"].includes(value)
  );
}
