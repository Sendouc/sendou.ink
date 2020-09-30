function calcSkillPoint2Percent(ap: number) {
  return Math.min(3.3 * ap - 0.027 * Math.pow(ap, 2), 100);
}

function get_slope(high: number, mid: number, low: number) {
  if (mid === low) {
    return 0;
  }
  return (mid - low) / (high - low);
}

function lerpN(p: number, s: number) {
  if (s.toFixed(3) === "0.500") {
    return p;
  }
  if (p === 0.0) {
    return p;
  }
  if (p === 1.0) {
    return p;
  }

  return Math.pow(Math.E, -1 * ((Math.log(p) * Math.log(s)) / Math.log(2)));
}

export function getEffect(
  abilityVals: number[],
  ap: number,
  ninjaSquid: boolean = false
) {
  const high = abilityVals[0];
  const mid = abilityVals[1];
  const low = abilityVals[2];
  const slope = get_slope(high, mid, low);
  let tmp = calcSkillPoint2Percent(ap);
  if (ninjaSquid) tmp *= 0.8;
  const percentage = tmp / 100.0;
  const result = low + (high - low) * lerpN(slope, percentage);

  return [result, lerpN(slope, percentage) * 100];
}
