import { useIsMounted } from "~/hooks/useIsMounted";
import { dateToYearMonthDayHourMinuteString } from "~/utils/dates";
import * as React from "react";

export function DateInput({
  id,
  name,
  defaultValue,
  min,
  max,
  required,
}: {
  id?: string;
  name?: string;
  defaultValue?: Date;
  min?: Date;
  max?: Date;
  required?: boolean;
}) {
  const [date, setDate] = React.useState(defaultValue ?? new Date());
  const isMounted = useIsMounted();

  if (!isMounted) {
    return (
      <input
        id={id}
        type="datetime-local"
        name={name}
        required={required}
        disabled
      />
    );
  }

  return (
    <>
      {date && <input name={name} type="hidden" value={date.getTime()} />}
      <input
        id={id}
        type="datetime-local"
        value={dateToYearMonthDayHourMinuteString(date)}
        min={min ? dateToYearMonthDayHourMinuteString(min) : undefined}
        max={max ? dateToYearMonthDayHourMinuteString(max) : undefined}
        onChange={(e) => setDate(new Date(e.target.value))}
        required={required}
      />
    </>
  );
}
