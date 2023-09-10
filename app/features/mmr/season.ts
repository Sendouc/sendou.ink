const SEASONS =
  process.env.NODE_ENV === "development"
    ? ([
        {
          nth: 0,
          starts: new Date("2020-08-14T15:00:00.000Z"),
          ends: new Date("2029-08-27T20:59:59.999Z"),
        },
      ] as const)
    : ([
        {
          nth: 0,
          starts: new Date("2023-08-14T17:00:00.000Z"),
          ends: new Date("2023-08-27T20:59:59.999Z"),
        },
        {
          nth: 1,
          starts: new Date("2023-09-11T17:00:00.000Z"),
          ends: new Date("2023-11-19T20:59:59.999Z"),
        },
      ] as const);

export type RankingSeason = (typeof SEASONS)[number];

export function currentOrPreviousSeason(date: Date) {
  const _currentSeason = currentSeason(date);
  if (_currentSeason) return _currentSeason;

  let latestPreviousSeason;
  for (const season of SEASONS) {
    if (date >= season.ends) latestPreviousSeason = season;
  }

  return latestPreviousSeason;
}

export function currentSeason(date: Date) {
  for (const season of SEASONS) {
    if (date >= season.starts && date <= season.ends) return season;
  }

  return null;
}

export function nextSeason(date: Date) {
  for (const season of SEASONS) {
    if (date < season.starts) return season;
  }

  return null;
}

export function seasonObject(nth: number) {
  return SEASONS[nth];
}

export function allSeasons(date: Date) {
  const startedSeasons = SEASONS.filter((s) => date >= s.starts);
  if (startedSeasons.length > 0) {
    return startedSeasons.map((s) => s.nth).reverse();
  }

  return [0];
}
