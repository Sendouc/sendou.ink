import { useIsMounted } from "~/hooks/useIsMounted";
import {
  dateToYearMonthDayHourMinuteString,
  getValidNewDateIfInvalid,
} from "~/utils/dates";
import * as React from "react";

export function DateInput({
  id,
  name,
  defaultValue,
  min,
  max,
  required,
  onChange,
}: {
  id?: string;
  name?: string;
  defaultValue?: Date;
  min?: Date;
  max?: Date;
  required?: boolean;
  onChange?: (newDate: Date) => void;
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
        onChange={(e) => {
          let updatedDate = new Date(e.target.value);
          updatedDate = getValidNewDateIfInvalid(updatedDate); // Validate date
          setDate(updatedDate);

          // Update the correct entry in the React hook from the parent via the passed on callback function
          if (typeof onChange !== "undefined") {
            onChange(updatedDate);
          }
        }}
        required={required}
      />
    </>
  );
}
