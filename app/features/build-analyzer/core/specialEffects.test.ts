import { suite } from "uvu";
import * as assert from "uvu/assert";
import { applySpecialEffects } from "./specialEffects";

const ApplySpecialEffects = suite("applySpecialEffects()");

const valueToAps = (value: number) => ({
  ap: value,
  apBeforeTacticooler: value,
});

ApplySpecialEffects("Adds an effect to empty build", () => {
  const aps = applySpecialEffects({
    effects: ["CB"],
    abilityPoints: new Map(),
    ldeIntensity: 0,
  });

  assert.equal(aps.size, 6);
  assert.equal(aps.get("ISM")?.ap, 10);
});

ApplySpecialEffects(
  "Adds an effect to build while keeping existing abilities untouched",
  () => {
    const aps = applySpecialEffects({
      effects: ["CB"],
      abilityPoints: new Map([["SPU", valueToAps(10)]]),
      ldeIntensity: 0,
    });

    assert.equal(aps.size, 7);
    assert.equal(aps.get("SPU")?.ap, 10);
  }
);

ApplySpecialEffects("Does not boost ability beyond 57", () => {
  const aps = applySpecialEffects({
    effects: ["CB"],
    abilityPoints: new Map([["ISM", valueToAps(57)]]),
    ldeIntensity: 0,
  });

  assert.equal(aps.get("ISM")?.ap, 57);
});

ApplySpecialEffects("Tacticooler doesn't boost swim speed beyond 29", () => {
  const aps = applySpecialEffects({
    effects: ["TACTICOOLER"],
    abilityPoints: new Map([["SSU", valueToAps(28)]]),
    ldeIntensity: 0,
  });

  assert.equal(aps.get("SSU")?.ap, 29);
});

ApplySpecialEffects(
  "Tacticooler limit swim speed at 29 if more in build",
  () => {
    const aps = applySpecialEffects({
      effects: ["TACTICOOLER"],
      abilityPoints: new Map([["SSU", valueToAps(30)]]),
      ldeIntensity: 0,
    });

    assert.equal(aps.get("SSU")?.ap, 30);
  }
);

ApplySpecialEffects("Tacticooler remembers AP before it was applied", () => {
  const aps = applySpecialEffects({
    effects: ["TACTICOOLER"],
    abilityPoints: new Map([["QR", valueToAps(10)]]),
    ldeIntensity: 0,
  });

  assert.equal(aps.get("QR")?.ap, 57);
  assert.equal(aps.get("QR")?.apBeforeTacticooler, 10);
});

ApplySpecialEffects("Applies many effects", () => {
  const aps = applySpecialEffects({
    effects: ["DR", "CB"],
    abilityPoints: new Map([["SSU", valueToAps(1)]]),
    ldeIntensity: 0,
  });

  assert.equal(aps.get("SSU")?.ap, 21);
});

ApplySpecialEffects("Applies LDE", () => {
  const aps = applySpecialEffects({
    effects: ["LDE"],
    abilityPoints: new Map([["ISM", valueToAps(1)]]),
    ldeIntensity: 1,
  });

  assert.equal(aps.get("ISM")?.ap, 2);
});

ApplySpecialEffects("Applies LDE (intensity != aps given)", () => {
  const aps = applySpecialEffects({
    effects: ["LDE"],
    abilityPoints: new Map([["ISM", valueToAps(1)]]),
    ldeIntensity: 15,
  });

  assert.equal(aps.get("ISM")?.ap, 18);
});

ApplySpecialEffects.run();
