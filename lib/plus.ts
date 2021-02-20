import { PlusRegion } from "@prisma/client";

export const getPercentageFromCounts = (
  countsNA: number[],
  countsEU: number[],
  votedUserRegion: PlusRegion
) => {
  const sameRegionArr = votedUserRegion === "NA" ? countsNA : countsEU;
  const otherRegionArr = votedUserRegion === "NA" ? countsEU : countsNA;

  const sameSum =
    sameRegionArr[0] * -2 +
    sameRegionArr[1] * -1 +
    sameRegionArr[2] * 1 +
    sameRegionArr[3] * 2;
  const sameVoterCount = sameRegionArr.reduce((acc, cur) => acc + cur, 0);

  const otherSum = otherRegionArr[1] * -1 + otherRegionArr[2] * 1;
  const otherVoterCount = otherRegionArr.reduce((acc, cur) => acc + cur, 0);

  return (
    ((sameSum / sameVoterCount + otherSum / otherVoterCount + 3) / 6) * 100
  );
};
