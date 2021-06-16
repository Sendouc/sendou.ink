import { adjustedSearchParams } from "./useMyRouter";

const TEST_URL = "https://sendou.ink/freeagents?xp=true&playstyle=MIDLINE";

describe("adjustedSearchParams", () => {
  test("no changes return search params unchanged", () => {
    const newParams = adjustedSearchParams(TEST_URL, []);
    const newParamsObj = Object.fromEntries(Array.from(newParams.entries()));

    expect(newParamsObj.xp).toBe("true");
    expect(newParamsObj.playstyle).toBe("MIDLINE");
    expect(Object.keys(newParamsObj).length).toBe(2);
  });

  test("adds search params while retaining old", () => {
    const newParams = adjustedSearchParams(TEST_URL, [["test", "works"]]);
    const newParamsObj = Object.fromEntries(Array.from(newParams.entries()));

    expect(newParamsObj.xp).toBe("true");
    expect(newParamsObj.playstyle).toBe("MIDLINE");
    expect(newParamsObj.test).toBe("works");
    expect(Object.keys(newParamsObj).length).toBe(3);
  });

  test("adds search params of number and boolean types", () => {
    const newParams = adjustedSearchParams(TEST_URL, [
      ["number", 2],
      ["boolean", true],
    ]);
    const newParamsObj = Object.fromEntries(Array.from(newParams.entries()));

    expect(newParamsObj.number).toBe("2");
    expect(newParamsObj.boolean).toBe("true");
  });

  test("falsy value removes the key", () => {
    const newParams = adjustedSearchParams(TEST_URL, [
      ["xp", ""],
      ["playstyle", null],
    ]);
    const newParamsObj = Object.fromEntries(Array.from(newParams.entries()));

    expect(Object.keys(newParamsObj).length).toBe(0);
  });
});
