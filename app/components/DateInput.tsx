import { useIsMounted } from "~/hooks/useIsMounted";
import { dateToYearMonthDayHourMinuteString } from "~/utils/dates";

export function DateInput({
  id,
  name,
  defaultValue,
  min,
  max,
  required,
  "data-cy": dataCy,
}: {
  id?: string;
  name?: string;
  defaultValue?: Date;
  min?: Date;
  max?: Date;
  "data-cy": string;
  required?: boolean;
}) {
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
    <input
      id={id}
      type="datetime-local"
      name={name}
      defaultValue={
        defaultValue
          ? dateToYearMonthDayHourMinuteString(defaultValue)
          : undefined
      }
      min={min ? dateToYearMonthDayHourMinuteString(min) : undefined}
      max={max ? dateToYearMonthDayHourMinuteString(max) : undefined}
      data-cy={dataCy}
      required={required}
    />
  );
}
