import type { MonthYear } from "./types";

export function lastCompletedVoting(now: Date): MonthYear {
  const thisMonthsRange = monthsVotingRange({
    month: now.getMonth(),
    year: now.getFullYear(),
  });

  if (thisMonthsRange.endDate.getTime() < now.getTime()) {
    return {
      month: thisMonthsRange.endDate.getMonth(),
      year: thisMonthsRange.endDate.getFullYear(),
    };
  }

  return previousMonth({
    month: thisMonthsRange.endDate.getMonth(),
    year: thisMonthsRange.endDate.getFullYear(),
  });
}

// xxx: rename... nextNonCompletedVoting ?
export function upcomingVoting(now: Date): MonthYear {
  return nextMonth(lastCompletedVoting(now));
}

/** Range of first Friday of a month to the following Monday (this range is when voting is active) */
export function monthsVotingRange({ month, year }: MonthYear) {
  const startDate = new Date(Date.UTC(year, month, 1, 10));

  while (startDate.getDay() !== 5) {
    startDate.setDate(startDate.getDate() + 1);
  }

  const endDate = new Date(startDate.getTime());
  endDate.setDate(endDate.getDate() + 3);

  return { startDate, endDate };
}

function previousMonth(input: MonthYear): MonthYear {
  let { month, year } = input;

  month--;
  if (month < 0) {
    month = 11;
    year--;
  }

  return { month, year };
}

function nextMonth(input: MonthYear): MonthYear {
  let { month, year } = input;

  month++;
  if (month === 12) {
    month = 0;
    year++;
  }

  return { month, year };
}
