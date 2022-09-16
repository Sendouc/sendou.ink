import { suite } from "uvu";
import * as assert from "uvu/assert";
import { applySpecialEffects } from "./specialEffects";

const ApplySpecialEffects = suite("applySpecialEffects()");

ApplySpecialEffects("Adds an effect to empty build", () => {
  const aps = applySpecialEffects({
    effects: ["CB"],
    abilityPoints: new Map(),
    ldeIntensity: 0,
  });

  assert.equal(aps.size, 6);
  assert.equal(aps.get("ISM"), 10);
});

ApplySpecialEffects(
  "Adds an effect to build while keeping existing abilities untouched",
  () => {
    const aps = applySpecialEffects({
      effects: ["CB"],
      abilityPoints: new Map([["SPU", 10]]),
      ldeIntensity: 0,
    });

    assert.equal(aps.size, 7);
    assert.equal(aps.get("SPU"), 10);
  }
);

ApplySpecialEffects("Does not boost ability beyond 57", () => {
  const aps = applySpecialEffects({
    effects: ["CB"],
    abilityPoints: new Map([["ISM", 57]]),
    ldeIntensity: 0,
  });

  assert.equal(aps.get("ISM"), 57);
});

ApplySpecialEffects("Tacticooler doesn't boost swim speed beyond 29", () => {
  const aps = applySpecialEffects({
    effects: ["TACTICOOLER"],
    abilityPoints: new Map([["SSU", 28]]),
    ldeIntensity: 0,
  });

  assert.equal(aps.get("SSU"), 29);
});

ApplySpecialEffects("Applies many effects", () => {
  const aps = applySpecialEffects({
    effects: ["DR", "CB"],
    abilityPoints: new Map([["SSU", 1]]),
    ldeIntensity: 0,
  });

  assert.equal(aps.get("SSU"), 21);
});

ApplySpecialEffects("Applies LDE", () => {
  const aps = applySpecialEffects({
    effects: ["LDE"],
    abilityPoints: new Map([["ISM", 1]]),
    ldeIntensity: 1,
  });

  assert.equal(aps.get("ISM"), 2);
});

ApplySpecialEffects("Applies LDE (intensity != aps given)", () => {
  const aps = applySpecialEffects({
    effects: ["LDE"],
    abilityPoints: new Map([["ISM", 1]]),
    ldeIntensity: 15,
  });

  assert.equal(aps.get("ISM"), 18);
});

ApplySpecialEffects.run();
