import React, { forwardRef } from "react"
import HackerOneDatePicker from "react-datepicker"
import Button from "./Button"
import "react-datepicker/src/stylesheets/datepicker.scss"

interface DatePickerProps {
  date: Date
  setDate: (date: Date | null) => void
}

interface CustomInputProps {
  value?: string
  onClick?: () => void
}

const DatePicker: React.FC<DatePickerProps> = ({ date, setDate }) => {
  const CustomInput: React.FC<CustomInputProps> = forwardRef(
    ({ onClick, value }, ref) => (
      <Button onClick={onClick as () => void}>{value as string}</Button>
    )
  )

  return (
    <HackerOneDatePicker
      selected={date}
      onChange={(date: Date | null) => setDate(date)}
      showTimeSelect
      timeFormat="HH:mm"
      timeIntervals={15}
      timeCaption="time"
      dateFormat="MMMM d, yyyy h:mm aa"
      customInput={<CustomInput />}
    />
  )
}

export default DatePicker
