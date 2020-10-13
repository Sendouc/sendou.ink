import { months } from "./lists";

export function choose(choices: any[]) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

export function importAll(r: __WebpackModuleApi.RequireContext) {
  const images: any = {};
  r.keys().forEach((item) => {
    images[item.substring(6, item.length - 4)] = r(item);
  });
  return images;
}

// https://coderwall.com/p/urxpsa/remove-falsy-values-or-empty-strings-from-javascript-objects
export const removeFalsy = (obj: { [key: string]: any }) => {
  const newObj: { [key: string]: any } = {};
  Object.keys(obj).forEach((prop: any) => {
    if (obj[prop]) {
      newObj[prop] = obj[prop];
    }
  });
  return newObj;
};

// https://weeknumber.net/how-to/javascript
export const getWeek = (dateInput: Date) => {
  const date = new Date(dateInput.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  // January 4 is always in week 1.
  const week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return (
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
};

export const getLocalizedMonthYearString = (
  month: number,
  year: number,
  locale: string
) => {
  const dateForLocalization = new Date();
  dateForLocalization.setDate(1);
  dateForLocalization.setMonth(month - 1);
  dateForLocalization.setFullYear(year);
  const localizedString = dateForLocalization.toLocaleString(locale, {
    month: "long",
    year: "numeric",
  });

  return localizedString.charAt(0).toUpperCase() + localizedString.slice(1);
};

export const parseAndGetLocalizedMonthYear = (
  monthYear: string,
  locale: string
) => {
  const [monthToParse, yearToParse] = monthYear.split(" ");
  const year = parseInt(yearToParse);
  const month = months.indexOf(monthToParse as any);

  return getLocalizedMonthYearString(month, year, locale);
};

export const getPlacementString = (placement: number) => {
  if (placement > 0 && placement < 4) return ["", "🥇", "🥈", "🥉"][placement];

  return placement + ".";
};
