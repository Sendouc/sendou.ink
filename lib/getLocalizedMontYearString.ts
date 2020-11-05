export const getLocalizedMonthYearString = (
  month: number,
  year: number,
  locale: string
) => {
  const dateForLocalization = new Date();
  dateForLocalization.setDate(1);
  dateForLocalization.setMonth(month - 1);
  dateForLocalization.setFullYear(year);
  return dateForLocalization.toLocaleString(locale, {
    month: "long",
    year: "numeric",
  });
};
