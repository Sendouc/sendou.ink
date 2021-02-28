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

export const getVotingRange = () => {
  const startDate = new Date();

  startDate.setUTCHours(10, 0, 0, 0);

  startDate.setDate(1);

  // Get the first Friday in the month
  while (startDate.getDay() !== 5) {
    startDate.setDate(startDate.getDate() + 1);
  }

  // Get the second Friday
  startDate.setDate(startDate.getDate() + 7);

  // Get the ending time on Monday
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 3);

  const isHappening =
    new Date().getTime() > startDate.getTime() &&
    new Date().getTime() < endDate.getTime();

  return { startDate, endDate, isHappening };
};
