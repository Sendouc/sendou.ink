import { Mode } from "@sendou-ink/api/common";
import { modesPerStage } from "./MapPoolTab";

describe("modesPerStage()", () => {
  test("lists are of right length", () => {
    const mapPool = [
      { name: "a", mode: "1" as Mode },
      { name: "b", mode: "2" as Mode },
      { name: "c", mode: "3" as Mode },
      { name: "c", mode: "1" as Mode },
    ];
    const stages = modesPerStage(mapPool);

    expect(stages.a.length).toBe(1);
    expect(stages.b.length).toBe(1);
    expect(stages.c.length).toBe(2);
  });

  test("lists have right content", () => {
    const mapPool = [
      { name: "a", mode: "1" as Mode },
      { name: "b", mode: "2" as Mode },
      { name: "c", mode: "3" as Mode },
      { name: "c", mode: "1" as Mode },
    ];
    const stages = modesPerStage(mapPool);

    expect(stages.c).toContain("3");
    expect(stages.c).toContain("1");
  });
});
