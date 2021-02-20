import { PlusRegion } from "@prisma/client";

export const getPercentageFromCounts = (
  countsNA: number[],
  countsEU: number[],
  votedUserRegion: PlusRegion
) => {
  const sameRegionArr = votedUserRegion === "NA" ? countsNA : countsEU;
  const otherRegionArr = votedUserRegion === "NA" ? countsEU : countsNA;

  const sameSum =
    sameRegionArr[0] * 0 +
    sameRegionArr[1] * 1 +
    sameRegionArr[2] * 2 +
    sameRegionArr[3] * 3;
  const sameVoterCount = sameRegionArr.reduce((acc, cur) => acc + cur, 0);
  const sameMax = sameVoterCount * 3;

  const otherSum = otherRegionArr[1] * 0 + otherRegionArr[2] * 1;
  const otherVoterCount = otherRegionArr.reduce((acc, cur) => acc + cur, 0);
  const otherMax = otherVoterCount * 1;

  return ((sameSum + otherSum) / (sameMax + otherMax)) * 100;
};
