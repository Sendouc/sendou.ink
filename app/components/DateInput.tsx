import { useIsMounted } from "~/hooks/useIsMounted";
import { dateToYearMonthDayHourMinuteString } from "~/utils/dates";
import * as React from "react";
import type { Dispatch, SetStateAction } from "react";

export function DateInput({
  id,
  name,
  defaultValue,
  min,
  max,
  required,
  "data-cy": dataCy,
  setDatesInputParentState,
  keyIndex,
}: {
  id?: string;
  name?: string;
  defaultValue?: Date;
  min?: Date;
  max?: Date;
  "data-cy": string;
  required?: boolean;
  setDatesInputParentState: Dispatch<
    SetStateAction<{ finalDateInputDate: Date; index: number }[]>
  >;
  keyIndex: number;
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
          const updatedDate = new Date(e.target.value);
          setDate(updatedDate);

          // Update the correct entry in the React hook from the parent
          setDatesInputParentState((current) =>
            current.map((obj) => {
              if (obj.index == keyIndex) {
                return { ...obj, finalDateInputDate: updatedDate };
              }

              return obj;
            })
          );
        }}
        data-cy={dataCy}
        required={required}
      />
    </>
  );
}
