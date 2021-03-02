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

const getSecondFridayDate = (nextMonth?: boolean) => {
  const result = new Date();

  if (nextMonth) result.setMonth(result.getMonth() + 1);

  result.setUTCHours(10, 0, 0, 0);

  result.setDate(1);

  // Get the first Friday in the month
  while (result.getDay() !== 5) {
    result.setDate(result.getDate() + 1);
  }

  // Get the second Friday
  result.setDate(result.getDate() + 7);

  return result;
};

export const getVotingRange = () => {
  const startDate = getSecondFridayDate();

  // Get the ending time on Monday
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 3);

  const isHappening =
    new Date().getTime() > startDate.getTime() &&
    new Date().getTime() < endDate.getTime();

  const nextVotingDate =
    startDate.getTime() > new Date().getTime()
      ? startDate
      : getSecondFridayDate(true);

  return { startDate, endDate, isHappening, nextVotingDate };
};
